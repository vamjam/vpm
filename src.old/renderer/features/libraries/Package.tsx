import { capitalCase } from 'capital-case'
import { ReactNode, useMemo } from 'react'
import { VscCircleLargeOutline } from 'react-icons/vsc'
import styled from 'styled-components'
import { Image, Package } from '@shared/entities'
import { PackageType } from '@shared/types'
import { Small, StackedView, View } from '~/components'

export type PackageComponentProps = {
  data: Package
  onChange: (pkg?: Package) => void
}

const Title = styled.h1`
  font-size: 0.9rem;
`

const PackageTypeMap: Record<PackageType, string> = {
  ADDON_PACKAGE: 'Addon Package',
  APPEARANCE: 'Appearance',
  ASSET_BUNDLE: 'Asset Bundle',
  CLOTHING: 'Clothing',
  FAVORITE: 'Favorite',
  HAIR: 'Hair',
  LEGACY_SCENE: 'Legacy Scene',
  MANIFEST: 'Manifest',
  MORPH: 'Morph',
  POSE: 'Pose',
  SCENE: 'Scene',
  SCRIPT: 'Script',
  SUBSCENE: 'Subscene',
  PRESET: 'Preset',
  TEXTURE: 'Texture',
}

const InfoHeader = styled(StackedView)`
  height: 4em;
  width: 100%;
  line-height: 1.3;
`

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  font-size: x-small;
  background: var(--colors-surface-6);
`

const StyledImage = styled.img`
  border-radius: var(--border-radius-2);
  object-fit: cover;
  width: 100%;
  box-shadow: 1px 1px 7px rgb(0 0 0 / 20%);
`

const Container = styled.div`
  padding: 0.5rem;
  overflow-wrap: break-word;
  border-radius: var(--border-radius-3);
  transition: background-color 0.2s ease-in-out;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${StyledImage} {
    transition: transform 0.2s ease-in-out;
  }

  &:hover {
    background-color: var(--colors-surface-8);

    ${StyledImage} {
      transform: scale(0.98);
    }
  }
`

const ThumbnailContainer = styled.div`
  position: relative;
`

const Thumbnail: React.FC<{
  images?: Omit<Image, 'packages'>[] | null
  children?: ReactNode
}> = ({ images, children }) => {
  const [main] = useMemo(() => {
    return (images ?? []).sort((a, b) => (b?.sort ?? 0) - (a?.sort ?? 0))
  }, [images])

  return (
    <ThumbnailContainer>
      {main && <StyledImage src={main.url} />}
      {children}
    </ThumbnailContainer>
  )
}

const formatName = (name: string) => {
  return capitalCase(name, {
    transform: (word: string) => {
      const newWord = word.replaceAll(/vam/gi, 'VaM ')

      return newWord
        .split(' ')
        .filter((word) => word.length > 0)
        .reduce((result, splitWord) => {
          return `${result} ${splitWord[0].toUpperCase() + splitWord.slice(1)}`
        }, '')
    },
  })
}

export default function PackageComponent({
  data,
  onChange,
}: PackageComponentProps): JSX.Element {
  const formattedName = useMemo(() => formatName(data.name), [data.name])
  const highestVersion = useMemo(
    () => Math.max(...(data.versions ?? [0])),
    [data.versions]
  )

  const tags = useMemo(() => {
    if (data.type != null) {
      return [PackageTypeMap[data.type], ...(data.tags ?? [])]
    }

    return data.tags ?? []
  }, [data.tags, data.type])

  return (
    <Container onClick={() => onChange(data)}>
      <Thumbnail images={data.images}>
        <VscCircleLargeOutline />
      </Thumbnail>
      <View
        justifyContent="space-between"
        flexDirection="column"
        alignItems="start"
      >
        <InfoHeader>
          <Title>{formattedName}</Title>
          <Small>
            {data.creator.name}.{data.name}.{highestVersion}
          </Small>
        </InfoHeader>
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </View>
    </Container>
  )
}
