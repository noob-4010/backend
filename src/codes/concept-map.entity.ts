import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ConceptMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source_code: string; // e.g., NAMASTE code

  @Column()
  target_code: string; // e.g., TM2 or ICD11 Biomed code

  @Column()
  target_system: string; // "TM2" | "ICD11-Biomed" | "ICD11-TM2"
}