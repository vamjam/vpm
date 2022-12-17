import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ImageSource } from '../enums'
import Package from './Package'

@Entity('images')
export default class Image {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text', { unique: true })
  url!: string

  @Column('text')
  source!: ImageSource

  @Column('int', { default: 0 })
  sort!: number

  @ManyToMany(() => Package, (pkg) => pkg.images)
  packages!: Package[]
}
