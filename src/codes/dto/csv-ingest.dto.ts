export class CsvIngestDto {
    system: string;        // NAMASTE / ICD11-TM2 / ICD11-Biomed
    code: string;          // e.g., "AYU002"
    name: string;          // e.g., "Vata Dosha"
    description?: string;  // optional
    tm2Code?: string;      // optional
    biomedCode?: string;   // optional
  }