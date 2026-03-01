import clsx from 'clsx'
import { useState } from 'react'
import { useEventListener } from 'usehooks-ts'
import styles from './Scanning.module.css'

export default function Scanning() {
  const [isShallowScanning, setIsShallowScanning] = useState(true)
  const [isDeepScanning, setIsDeepScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [subHeading, setSubHeading] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEventListener('scan' as any, (e: CustomEvent) => {
    const parsed = JSON.parse(e.detail)

    switch (parsed.type) {
      case 'shallow.start':
        return setIsShallowScanning(true)
      case 'shallow.complete':
        return setIsShallowScanning(false)
      case 'deep.start':
        return setIsDeepScanning(true)
      case 'deep.complete':
        return setIsDeepScanning(false)
      case 'shallow.progress':
        setSubHeading(parsed.assetType)
        return setProgress(parsed.value)
      case 'deep.progress':
        return setProgress(parsed.value)
    }
  })

  return isShallowScanning || isDeepScanning ? (
    <div
      className={clsx(styles.container, {
        [styles.shallow]: isShallowScanning,
        [styles.deep]: isDeepScanning,
      })}>
      <span>
        <p>Scan in progress.</p>
        {subHeading && <span>{subHeading}</span>}
      </span>
      <div>{progress}%</div>
      <progress value={progress} max={100} />
      <p>Please wait...</p>
    </div>
  ) : null
}
