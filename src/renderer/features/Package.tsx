import { capitalCase } from 'capital-case'
import { ReactNode, useMemo } from 'react'
import { VscCircleFilled, VscCircleLargeOutline } from 'react-icons/vsc'
import styled, { css } from 'styled-components'
import { PackageType } from '@shared/enums'
import { ExternalImage, Image, Package } from '@shared/types'
import { View } from '~/components'

export type PackageComponentProps = {
  data: Package
  selected: boolean
  onChange: (isSelected: boolean, pkg?: Package) => void
}

const Title = styled.h1`
  font-size: 0.9rem;
`

const Small = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.7rem;
`

export default function PackageComponent({
  data,
  selected,
  onChange,
}: PackageComponentProps): JSX.Element {
  const formattedName = useMemo(() => formatName(data.name), [data.name])

  const packageType = useMemo(() => {
    return PackageType.fromValue(data.type)?.name
  }, [data.type])

  return (
    <Container $selected={selected} onClick={() => onChange(!selected)}>
      <Thumbnail $images={data.images}>
        <SelectedIcon $selected={selected}>
          {selected && <VscCircleFilled />}
          <VscCircleLargeOutline />
        </SelectedIcon>
      </Thumbnail>
      <View
        justifyContent="space-between"
        flexDirection="column"
        alignItems="start"
      >
        <InfoHeader>
          <Title>{formattedName}</Title>
          <Small>{data.creator.name}</Small>
        </InfoHeader>
        <Tag>{packageType}</Tag>
      </View>
    </Container>
  )
}

const InfoHeader = styled(View).attrs({
  $justify: 'space-between',
  $align: 'baseline',
})`
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
  background: ${({ theme }) => theme.colors.surface600};
`

const StyledImage = styled.img`
  border-radius: 0.5rem;
  object-fit: cover;
  width: 100%;
  box-shadow: 1px 1px 7px rgb(0 0 0 / 20%);
`

const Container = styled.div<{ $selected: boolean }>`
  padding: 0.5rem;
  overflow-wrap: break-word;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease-in-out;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${StyledImage} {
    transition: transform 0.2s ease-in-out;
  }

  ${({ $selected, theme }) =>
    $selected
      ? css`
          background-color: ${theme.colors.surface50};
          border: 1px solid ${theme.colors.accent};

          ${StyledImage} {
            transform: scale(0.97);
          }

          &:hover {
            background-color: ${theme.colors.surface300};
          }
        `
      : css`
          &:hover {
            background-color: ${theme.colors.primary850};

            ${StyledImage} {
              transform: scale(0.98);
            }
          }
        `}
`

const SelectedIcon = styled.div<{ $selected: boolean }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;

  ${({ $selected, theme }) =>
    $selected &&
    css`
      color: ${theme.colors.accent};
    `}

  > svg {
    position: absolute;
  }
`

const ThumbnailContainer = styled.div`
  position: relative;
`

const Thumbnail: React.FC<{
  $images?: (Omit<Image, 'packageId'> | ExternalImage)[]
  children?: ReactNode
}> = ({ $images, children }) => {
  const [main] = useMemo(() => {
    return ($images ?? []).sort(
      (a, b) => ((b?.sort as Image) ?? 0) - ((a?.sort as Image) ?? 0)
    )
  }, [$images])
  // const [mainThumbnail] = useMemo(() => {

  //   if ($images?.length > 1) {
  //     return ($images ?? []).sort((a, b) => b.sort - a.sort)
  //   }
  // }, [$images])

  return (
    <ThumbnailContainer>
      {main && <StyledImage src={main.path} />}
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
