import { FormEvent, useCallback, useState } from 'react'
import { Library } from '@filejam/shared/types'
import Button from '~/components/input/button/Button.tsx'
import Stack from '~/components/layout/stack/Stack.tsx'
import useIPC from '~/hooks/useIPC.ts'
import styles from './EditLibrary.module.css'

type EditLibraryProps = {
  data?: Library
  mode?: 'edit' | 'create'
}

export default function EditLibrary({ data, mode }: EditLibraryProps) {
  const user = useIPC('user.current.get')

  const [name, setName] = useState(data?.name || '')
  const [dir, setDir] = useState(data?.sources[0] || '')
  const [error, setError] = useState<string | null>(
    user.error ? user.error.message : null,
  )
  const [isDirectorySelecting, setIsDirectorySelecting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)

      if (!dir) {
        setError('You must select a location for the library.')
        return
      }

      if (!user.data) {
        setError('No user found.')
        return
      }

      try {
        setIsSubmitting(true)
        if (mode === 'edit') {
          await window.api['library.update'](data!.id, {
            name,
            sources: [dir],
          })
        } else {
          await window.api['library.create'](user.data.id, dir, name)
        }
      } catch (err) {
        console.error(err)
        setError('Failed to create library.')
      } finally {
        setIsSubmitting(false)
      }
    },
    [dir, user.data, mode, data, name],
  )

  const handleBrowseClick = useCallback(async () => {
    if (isDirectorySelecting) return

    setIsDirectorySelecting(true)

    try {
      const selectedDir = await window.api['directory.select']()
      if (selectedDir) setDir(selectedDir)
    } catch (err) {
      console.error(err)
      setError('Failed to select directory.')
    } finally {
      setIsDirectorySelecting(false)
    }
  }, [isDirectorySelecting])

  return (
    <form onSubmit={handleFormSubmit} className={styles.form}>
      <label>
        <span>Name:</span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Library"
        />
      </label>

      <label className={styles.fileInput} onClick={handleBrowseClick}>
        <span>Location:</span>
        <input name="location" value={dir} readOnly />
        <Button>Browse…</Button>
      </label>

      <Stack
        direction="row"
        justify="space-between"
        align="center"
        style={{ paddingLeft: 'var(--space-3)' }}>
        <small style={{ color: 'var(--color-red)' }}>{error}</small>
        <Button type="submit" primary disabled={isSubmitting || !dir}>
          {mode === 'edit' ? 'Save Changes' : 'Create Library'}
        </Button>
      </Stack>
    </form>
  )
}
