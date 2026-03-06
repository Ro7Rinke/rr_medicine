export class CreateMedicationDto {
  name: string;
  dosage?: number;
  unit?: string;
  type?: 'pill' | 'capsule' | 'liquid' | 'injection' | 'drops' | 'other';
  notes?: string;
}