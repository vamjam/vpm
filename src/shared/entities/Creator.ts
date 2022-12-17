import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import Package from './Package'

@Entity('creators')
export default class Creator {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text', { unique: true })
  name!: string

  @Column('text', { nullable: true })
  avatar!: string | null

  @OneToMany(() => Package, (pkg) => pkg.creator)
  packages!: Package[]
}
