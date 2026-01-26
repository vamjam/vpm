import fs from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'glob'
import ts from 'typescript'

type DecoratedMethod = {
  channel: string
  signature: string
  referencedTypes: Set<string>
}

type ImportMap = Map<
  string,
  {
    default?: string
    names: Set<string>
  }
>

const BUILT_IN_TYPES = new Set([
  'Array',
  'Promise',
  'Record',
  'Pick',
  'Omit',
  'Partial',
  'Required',
  'Readonly',
  'ReturnType',
  'Parameters',
  'NonNullable',
  'Exclude',
])

async function main() {
  const inputPaths = await parseArgs()

  for (const inputPath of inputPaths) {
    await generateFile(inputPath)
  }
}

async function generateFile(inputPath: string) {
  const resolvedInput = path.resolve(process.cwd(), inputPath)
  const { outputPath, typeName, baseInputPath } = derivePaths(resolvedInput)

  const sourceText = await fs.readFile(resolvedInput, 'utf8')
  const sourceFile = ts.createSourceFile(
    resolvedInput,
    sourceText,
    ts.ScriptTarget.ESNext,
    /*setParentNodes*/ true,
    ts.ScriptKind.TS,
  )

  const methods = extractDecoratedMethods(sourceFile, 'expose')

  if (methods.length === 0) {
    console.log(
      `No methods decorated with @expose found in ${path.relative(process.cwd(), resolvedInput)}`,
    )

    return
  }

  const imports = buildImports(sourceFile, methods)

  const content = renderTypeFile(
    typeName,
    methods,
    imports,
    baseInputPath,
    outputPath,
  )

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, content, 'utf8')

  console.log(
    `Generated ${typeName} with ${methods.length} method(s) -> ${path.relative(process.cwd(), outputPath)}`,
  )
}

async function parseArgs() {
  const [, , ...files] = process.argv

  if (files.length === 0) {
    throw new Error(
      'Usage: tsx apps/electron/scripts/generate-api-types.ts <service-file> [more service files...]',
    )
  }

  const globs = files.map((pattern) =>
    glob(pattern, {
      cwd: process.cwd(),
    }),
  )

  return (await Promise.all(globs)).flat()
}

function derivePaths(inputPath: string) {
  const baseName = path.basename(inputPath, path.extname(inputPath)) // e.g. library.service
  const stem = baseName.replace(/\.service$/i, '') || baseName
  const typeName = `${toPascal(stem)}API`
  const outputPath = path.resolve(
    process.cwd(),
    'src/shared/generated',
    `${stem}.api.ts`,
  )

  return {
    outputPath,
    typeName,
    baseInputPath: inputPath,
  }
}

function toPascal(value: string) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

function extractDecoratedMethods(
  sourceFile: ts.SourceFile,
  decoratorName: string,
): DecoratedMethod[] {
  const methods: DecoratedMethod[] = []

  sourceFile.forEachChild((node) => {
    if (!ts.isClassDeclaration(node)) return

    node.members.forEach((member) => {
      if (!ts.isMethodDeclaration(member)) return

      const decorators =
        (ts.canHaveDecorators(member) && ts.getDecorators(member)) ?? []

      const decorator = Array.isArray(decorators)
        ? decorators.find((d) => {
            if (!ts.isCallExpression(d.expression)) return false
            const expr = d.expression.expression
            const isMatch =
              (ts.isIdentifier(expr) && expr.text === decoratorName) ||
              (ts.isPropertyAccessExpression(expr) &&
                ts.isIdentifier(expr.name) &&
                expr.name.text === decoratorName)
            return isMatch
          })
        : undefined

      if (!decorator || !ts.isCallExpression(decorator.expression)) return

      const [firstArg] = decorator.expression.arguments
      if (!firstArg || !ts.isStringLiteral(firstArg)) return

      const channel = firstArg.text
      const signature = buildSignature(member, sourceFile)
      const referencedTypes = collectTypeRefs(member)

      methods.push({ channel, signature, referencedTypes })
    })
  })

  return methods
}

function buildSignature(
  method: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
): string {
  const params = method.parameters.map((param) => param.getText(sourceFile))
  const returnType = method.type ? method.type.getText(sourceFile) : 'unknown'

  return `(${params.join(', ')}) => ${returnType}`
}

function collectTypeRefs(method: ts.MethodDeclaration): Set<string> {
  const refs = new Set<string>()

  const visit = (typeNode: ts.TypeNode | undefined) => {
    if (!typeNode) return

    const walk = (node: ts.Node) => {
      if (ts.isTypeReferenceNode(node)) {
        const name = extractIdentifier(node.typeName)
        if (name && !BUILT_IN_TYPES.has(name)) {
          refs.add(name)
        }
      }
      node.forEachChild(walk)
    }

    walk(typeNode)
  }

  method.parameters.forEach((param) => visit(param.type))
  visit(method.type)

  return refs
}

function extractIdentifier(entity: ts.EntityName): string | undefined {
  if (ts.isIdentifier(entity)) return entity.text
  return extractIdentifier(entity.right)
}

function buildImports(
  sourceFile: ts.SourceFile,
  methods: DecoratedMethod[],
): ImportMap {
  const neededTypes = new Set<string>()
  methods.forEach((m) => m.referencedTypes.forEach((t) => neededTypes.add(t)))

  const imports: ImportMap = new Map()

  sourceFile.statements.forEach((stmt) => {
    if (!ts.isImportDeclaration(stmt)) return
    const importClause = stmt.importClause
    if (!importClause) return

    const specifiers: string[] = []
    let defaultImport: string | undefined

    if (importClause.name) {
      defaultImport = importClause.name.text
      if (neededTypes.has(defaultImport)) {
        // keep default import if it's referenced as a type
      } else {
        defaultImport = undefined
      }
    }

    if (
      importClause.namedBindings &&
      ts.isNamedImports(importClause.namedBindings)
    ) {
      for (const spec of importClause.namedBindings.elements) {
        const name = spec.name.text
        if (neededTypes.has(name)) {
          specifiers.push(name)
        }
      }
    }

    if (specifiers.length === 0 && !defaultImport) return

    const moduleSpecifier = (stmt.moduleSpecifier as ts.StringLiteral).text
    const existing = imports.get(moduleSpecifier) ?? { names: new Set() }

    if (defaultImport) existing.default = defaultImport
    specifiers.forEach((n) => existing.names.add(n))

    imports.set(moduleSpecifier, existing)
  })

  return imports
}

function renderTypeFile(
  typeName: string,
  methods: DecoratedMethod[],
  imports: ImportMap,
  inputPath: string,
  outputPath: string,
): string {
  const lines: string[] = []
  const outputDir = path.dirname(outputPath)
  const normalizedImports = normalizeImportMap(imports, outputDir)

  lines.push(
    `// Auto-generated from ${path.relative(process.cwd(), inputPath)}`,
    '// Do not edit directly.',
    '',
  )

  normalizedImports.forEach(({ default: defaultImport, names }, spec) => {
    const named = Array.from(names).sort()
    const parts: string[] = []
    if (defaultImport) parts.push(defaultImport)
    if (named.length) {
      parts.push(`{ ${named.join(', ')} }`)
    }
    lines.push(`import type ${parts.join(', ')} from '${spec}'`)
  })

  if (imports.size) lines.push('')

  lines.push('export default {')

  methods.forEach((method) => {
    lines.push(
      `  '${method.channel}': undefined as unknown as ${method.signature},`,
    )
  })

  lines.push('}', '')

  return lines.join('\n')
}

function normalizeImportMap(imports: ImportMap, outputDir: string): ImportMap {
  const normalized: ImportMap = new Map()

  imports.forEach((value, spec) => {
    const resolvedSpec = resolveImportSpecifier(spec, outputDir)
    const existing = normalized.get(resolvedSpec) ?? {
      names: new Set<string>(),
    }

    if (value.default) existing.default = value.default
    value.names.forEach((name) => existing.names.add(name))

    if (!normalized.has(resolvedSpec)) {
      normalized.set(resolvedSpec, existing)
    }
  })

  return normalized
}

function resolveImportSpecifier(specifier: string, outputDir: string): string {
  if (specifier.startsWith('@shared/')) {
    const relativePath = path.relative(
      outputDir,
      path.resolve(
        process.cwd(),
        'src/shared',
        specifier.replace('@shared/', ''),
      ),
    )

    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
  }

  return specifier
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
