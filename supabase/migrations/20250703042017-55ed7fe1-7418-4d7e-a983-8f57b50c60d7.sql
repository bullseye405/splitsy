
-- Enable RLS on expenses and expense_splits tables
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses table (public access for now since no auth is implemented)
CREATE POLICY "Allow all operations on expenses" ON public.expenses
FOR ALL USING (true) WITH CHECK (true);

-- Create RLS policies for expense_splits table (public access for now since no auth is implemented)
CREATE POLICY "Allow all operations on expense_splits" ON public.expense_splits
FOR ALL USING (true) WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_group_id_fkey 
FOREIGN KEY (group_id) REFERENCES public.group(id) ON DELETE CASCADE;

ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_paid_by_fkey 
FOREIGN KEY (paid_by) REFERENCES public.participants(id) ON DELETE CASCADE;

ALTER TABLE public.expense_splits 
ADD CONSTRAINT expense_splits_expense_id_fkey 
FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;

ALTER TABLE public.expense_splits 
ADD CONSTRAINT expense_splits_participant_id_fkey 
FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;
