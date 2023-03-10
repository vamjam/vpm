export default interface LibraryService<ImportDataType = URL> {
  scanLibrary(vam: URL): Promise<void>
  importPackage(data: ImportDataType): Promise<void>
}
