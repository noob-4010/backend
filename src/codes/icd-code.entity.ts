import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class IcdCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;
}