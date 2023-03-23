import { Card, Grid } from '~/components/Layout'
import useFetcher from './useFetcher'

export default function Assets() {
  const { data, error, loading } = useFetcher('assets:get')

  return (
    <Grid>
      {Object.entries(data ?? {}).map(([id, asset]) => {
        return (
          <Card
            key={id}
            title={asset.name}
            image={asset.images?.[0].url}
            date={asset.createdAt ?? undefined}
            sourceImage={asset.creator?.avatar ?? undefined}
            sourceName={asset.creator?.name ?? undefined}
          />
        )
      })}
    </Grid>
  )
}
