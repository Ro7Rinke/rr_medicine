export class CreateScheduleDto {
  medication_id: string;
  treatment_id?: string;
  time_of_day: string;
  quantity?: number;
  days_of_week?: number[];
}