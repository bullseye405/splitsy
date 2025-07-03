export interface Settlement {
  amount: number;
  created_at: string;
  description: string | null;
  from_participant_id: string;
  group_id: string;
  id: string;
  settlement_date: string;
  to_participant_id: string;
}
