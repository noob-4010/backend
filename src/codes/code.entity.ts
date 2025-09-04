import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Code {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  system: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
}