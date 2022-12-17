import { useCallback, useEffect, useRef, useState } from 'react'

const data = {
  ...(await window.api?.getConfig()),
}

/**
 * A simple hook for working with the app's config.
 * @returns Object containing the config and a function to
 * invalidate the config.
 */
export default function useConfig() {
  const config = useRef(data)
  const [isValid, setIsValid] = useState(true)
  const invalidate = useCallback(() => setIsValid(false), [])

  useEffect(() => {
    if (isValid === false) {
      window.api?.getConfig().then((data) => (config.current = data))

      setIsValid(true)
    }
  }, [config, isValid])

  return { config: config.current, invalidateConfig: invalidate }
}
