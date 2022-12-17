import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('failed_import_packages')
export default class FailedImportPackage {
  @PrimaryGeneratedColumn()
  id!: number

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @Column('text')
  reason!: string

  @Column('text')
  url!: string

  @Column('text', { nullable: true })
  name!: string | null

  @Column('text', { nullable: true })
  creatorName!: string | null

  @Column('int', { nullable: true })
  version!: number | null
}
