import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'concept_map' })
export class ConceptMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source_code: string; // NAMASTE code

  @Column()
  target_code: string; // ICD-11 TM2 / Biomed code

  @Column()
  target_system: string; // e.g., "ICD11-TM2" or "ICD11-Biomed"
}