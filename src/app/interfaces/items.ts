import { DailyAvailability } from './dailyAvailability';

export interface Items {
  id_item: number;
  name: string;
  description: string;
  type_item: number;
  photo: string;
  price: number;
  dailyAvailabilities?: DailyAvailability[];
}
