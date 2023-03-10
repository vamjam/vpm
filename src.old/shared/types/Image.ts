import { Image as ImageEntity } from '../entities'

type Image = Omit<ImageEntity, 'id'> & {
  id: string
}

export default Image
