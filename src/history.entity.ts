import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class HistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  date: Date;

  @Column()
  objectId: string;

  @Column()
  field: string;

  @Column({ nullable: true })
  modifiedById: string;

  @Column({ nullable: true })
  oldValue: string;

  @Column({ nullable: true })
  newValue: string;
}
