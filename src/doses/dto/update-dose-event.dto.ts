export class UpdateDoseEventDto {
  status?: 'pending' | 'taken' | 'skipped' | 'missed';
  responded_at?: Date;
}