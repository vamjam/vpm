import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { isNullOrEmpty } from '@shared/utils/String'
import Box from './Box'

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  image?: string
  title: string
  date?: Date
  sourceName?: string
  sourceImage?: string
}

const Container = styled(Box)`
  border-radius: var(--border-radius-2);
  background: var(--color-bg-5);
  overflow: hidden;
`

const Thumbnail = styled('img')`
  width: 100%;
  object-fit: contain;
  flex: 1.5;
`

const ContentContainer = styled(Box)`
  flex: 1;
`

const Content = styled('div')`
  width: 100%;
`

const Title = styled('span')`
  display: block;
  font-size: larger;
`

const Small = styled('span')`
  display: block;
  font-size: smaller;
`

const Source = styled('div')``

export default function Card({
  image,
  title,
  date,
  sourceName,
  sourceImage,
  ...props
}: CardProps) {
  return (
    <Container {...props}>
      <Thumbnail src={image ?? ''} />
      <ContentContainer>
        <Content>
          <Title>{title}</Title>
          <Small>{date?.toString()}</Small>
        </Content>
        <Source>
          {!isNullOrEmpty(sourceImage) && <img src={sourceImage} />}
          {!isNullOrEmpty(sourceName) && <Small>{sourceName}</Small>}
        </Source>
      </ContentContainer>
    </Container>
  )
}
