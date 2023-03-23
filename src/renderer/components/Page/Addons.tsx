import { Card, Grid } from '~/components/Layout'
import useFetcher from './useFetcher'

export default function Addons() {
  const { data, error, loading } = useFetcher('addons:get')

  return (
    <Grid>
      {Object.entries(data ?? {}).map(([id, addon]) => {
        return (
          <Card
            key={id}
            title={addon.name}
            image={addon.images?.[0].url}
            date={addon.createdAt ?? undefined}
            sourceImage={addon.creator?.avatar ?? undefined}
            sourceName={addon.creator?.name ?? undefined}
          />
        )
      })}
    </Grid>
  )
}
