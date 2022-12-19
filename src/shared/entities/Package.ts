import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PackageType } from '../enums'
import Creator from './Creator'
import Image from './Image'

export type HubPackage = {
  attachmentId?: number

  releasedAt?: Date
  createdAt?: Date
  updatedAt?: Date
  type?: string
  category?: string
  parentCategoryId?: number

  hosted?: boolean
  downloadable?: boolean
  url?: string

  rating?: number
  viewCount?: number
  downloadCount?: number
  ratingCount?: number
}

@Entity('packages')
export default class Package {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('int', { nullable: true })
  hubPackageId!: number | null

  @Column('int', { nullable: true })
  hubResourceId!: number | null

  isInstalled?: boolean
  isSaved?: boolean

  @Column('text')
  name!: string

  @Column('text', { unique: true })
  url!: string

  @Column('int', { nullable: true })
  size!: number | null

  @Column('text', { nullable: true })
  type!: PackageType | null

  @Column('simple-array', { nullable: true })
  versions!: number[] | null

  // A conveinent prop for a single version
  // Not saved to the database.
  version?: number | null

  @Column('int', { nullable: true })
  fileCreatedAt!: Date | null

  @Column('int', { nullable: true })
  fileUpdatedAt!: Date | null

  @Column('text', { nullable: true })
  description!: string | null

  @Column('text', { nullable: true })
  instructions!: string | null

  @Column('text', { nullable: true })
  credits!: string | null

  @Column('text', { nullable: true })
  licenseType!: string | null

  @ManyToOne(() => Creator, (creator) => creator.packages)
  creator!: Creator

  @Column('int', { nullable: true })
  creatorId!: number | null

  @JoinTable()
  @ManyToMany(() => Image, {
    nullable: true,
    cascade: true,
  })
  images!: Image[] | null

  @Column('int', { nullable: true })
  imagesUpdatedAt!: Date | null

  @OneToMany(() => Package, (pkg) => pkg.dependants, {
    nullable: true,
  })
  dependencies!: Package[] | null

  @OneToMany(() => Package, (pkg) => pkg.dependencies, {
    nullable: true,
  })
  dependants!: Package[] | null

  @Column('simple-array', { nullable: true })
  tags!: string[] | null

  @Column('simple-json', { nullable: true })
  hub!: HubPackage | null
}
