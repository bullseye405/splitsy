
-- Create settlements table to record settled transactions
CREATE TABLE public.settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.group(id) ON DELETE CASCADE,
  from_participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  to_participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  description text,
  settlement_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on settlements table
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for settlements (public access for now since no auth is implemented)
CREATE POLICY "Allow all operations on settlements" ON public.settlements
FOR ALL USING (true) WITH CHECK (true);

-- Add expense_type column to expenses table to differentiate between expense, transfer, and income
ALTER TABLE public.expenses ADD COLUMN expense_type text DEFAULT 'expense';

-- Add constraint to ensure expense_type is one of the allowed values
ALTER TABLE public.expenses ADD CONSTRAINT expenses_expense_type_check 
CHECK (expense_type IN ('expense', 'transfer', 'income'));
