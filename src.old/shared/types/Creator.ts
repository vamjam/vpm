import { Creator as CreatorEntity } from '../entities'
import hashid from '../utils/hashid'

type Creator = Omit<CreatorEntity, 'id'> & {
  id: string
}

export default Creator

export const SelfCreator: Creator = {
  id: hashid.encode(1),
  name: 'SELF',
  avatar: null,
}
