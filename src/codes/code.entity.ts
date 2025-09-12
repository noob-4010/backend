// src/codes/code.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Code {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  system: string; // NAMASTE, TM2, ICD11-Biomed, ICD11-TM2

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  tm2Code: string; // TM2 mapping

  @Column({ nullable: true })
  biomedCode: string; // ICD-11 Biomed

  @Column({ nullable: true })
  icd11TM2Code: string; // ICD-11 TM2
}