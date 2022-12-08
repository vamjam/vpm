import chalk, { ChalkFunction } from 'chalk'
import Color from 'color'
import { HTMLAttributes, useCallback, useEffect, useMemo, useRef } from 'react'
import styled, { useTheme } from 'styled-components'
import { ITerminalOptions } from 'xterm'
import { XTerm } from 'xterm-for-react'
import Xterm from 'xterm-for-react/dist/src/XTerm'
import { ApiEvent } from '@shared/types'
import { State, useStore } from '~/store'
import autoHideScrollbar from '~/utils/autoHideScrollbar'

const termStyle = {
  fontFamily: '"SF Mono", monospace',
  fontSize: 12,
}

const prefixVPM = (accent: string) => chalk.hex(accent)('vpm')
const prefixArrow = chalk.greenBright('›')
const consoleWhite = chalk.hex('#bbbbbb')

const prefix = (accent: string) => {
  const timestamp = chalk.dim(timeStampFormatter.format(new Date()))

  return `${timestamp} ${prefixVPM(accent)} ${prefixArrow}`
}

const formatDoubleQuotes = (str: string, accent: string) => {
  const dq = str.match(/(?:"[^"]*"|^[^"]*$)/)?.[0]

  if (dq != null) {
    return str.replace(dq, chalk.hex(accent)(dq))
  }

  return str
}

export default function Console(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  const ref = useRef<Xterm | null>(null)
  // const addonFit = useMemo(() => new FitAddon(), [])
  const { accent, surface } = useTheme().colors
  const darkAccent = useMemo(() => Color(accent).darken(0.2).hex(), [accent])

  const termOptions: ITerminalOptions = useMemo(
    () => ({
      disableStdin: true,
      convertEol: true,
      fontSize: termStyle.fontSize,
      fontFamily: termStyle.fontFamily,
      cursorBlink: false,
      customGlyphs: true,
      rendererType: 'dom',
      theme: {
        background: surface,
      },
    }),
    [surface]
  )

  const writeln = useCallback(
    (data: string) => {
      ref.current?.terminal?.writeln(
        `${prefix(accent)} ${consoleWhite(
          formatDoubleQuotes(data, darkAccent)
        )}`
      )
    },
    [accent, darkAccent]
  )

  const initApiListener = useCallback(
    (channel: ApiEvent, ci?: ChalkFunction) => {
      window.api?.on(channel, (_: unknown, data: string) => {
        console.log(channel, _, data)

        writeln(ci ? ci(data) : data)
      })
    },
    [writeln]
  )

  useEffect(() => {
    initApiListener('log:info')
    initApiListener('log:warn', chalk.yellow)
    initApiListener('log:err', chalk.red)
    initApiListener('scan:error', chalk.red)

    ref.current?.terminal?.clear()
    writeln('Console started')
  }, [initApiListener, writeln])

  return (
    <Container {...props}>
      <ConsoleProgress />
      <XTerm ref={ref} options={termOptions} />
    </Container>
  )
}

const Container = styled.div`
  padding: 1rem 0 0 1rem;
  background: ${({ theme }) => theme.colors.surface};
  ${autoHideScrollbar('y')}

  > div {
    height: 100%;
  }
`

const selector = ({ isScanning, scanProgress }: State) => ({
  isScanning,
  scanProgress,
})

const ProgressContainer = styled.progress`
  -webkit-appearance: none;
  appearance: none;
  width: calc(100% - 1rem);
  height: 5px;
  background-color: rgba(0, 0, 0, 0.2);

  &::-webkit-progress-bar {
    background-color: #7be0ab;
  }
`

const ConsoleProgress: React.FC = () => {
  const { scanProgress, isScanning } = useStore(selector)

  return isScanning ? (
    <ProgressContainer max="100" value={scanProgress} />
  ) : null
}

const timeStampFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})
