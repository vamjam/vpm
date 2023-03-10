import { Package as PackageEntity } from '@shared/entities'
import { Creator, Package, PackageType } from '@shared/types'
import { encode } from '@shared/utils/hashid'

const DTOEntityMap: Record<keyof PackageEntity, unknown> = {
  id: (val: number) => encode(val),
  name: (val: string) => val,
  type: (val: string) => val as PackageType,
  tags: (val: string) => val.split(','),
}

export default DTOEntityMap
