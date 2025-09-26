-- Enable RLS on tables that are missing it for security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."group" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- Create basic policies for participants table
CREATE POLICY "Allow all operations on participants" 
ON public.participants 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create basic policies for group table
CREATE POLICY "Allow all operations on group" 
ON public."group" 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create basic policies for expenses table
CREATE POLICY "Allow all operations on expenses" 
ON public.expenses 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create basic policies for expense_splits table
CREATE POLICY "Allow all operations on expense_splits" 
ON public.expense_splits 
FOR ALL 
USING (true) 
WITH CHECK (true);