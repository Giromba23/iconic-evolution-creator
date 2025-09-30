-- Create evolution_entries table
CREATE TABLE public.evolution_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.evolution_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (public access)
CREATE POLICY "Allow public read access" 
ON public.evolution_entries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.evolution_entries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.evolution_entries 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.evolution_entries 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_evolution_entries_updated_at
BEFORE UPDATE ON public.evolution_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();