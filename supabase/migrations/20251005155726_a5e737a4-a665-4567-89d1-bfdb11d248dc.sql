-- Create storage bucket for filter icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('filter-icons', 'filter-icons', true);

-- Create table for filter categories (Tier, Affinity, Class)
CREATE TABLE public.filter_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  icon_color text NOT NULL DEFAULT '#6366f1',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for filter items
CREATE TABLE public.filter_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.filter_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_name text NOT NULL,
  icon_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Enable RLS
ALTER TABLE public.filter_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filter_items ENABLE ROW LEVEL SECURITY;

-- Policies for filter_categories
CREATE POLICY "Anyone can view filter categories"
ON public.filter_categories FOR SELECT
USING (true);

CREATE POLICY "Admins can insert filter categories"
ON public.filter_categories FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update filter categories"
ON public.filter_categories FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete filter categories"
ON public.filter_categories FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for filter_items
CREATE POLICY "Anyone can view filter items"
ON public.filter_items FOR SELECT
USING (true);

CREATE POLICY "Admins can insert filter items"
ON public.filter_items FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update filter items"
ON public.filter_items FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete filter items"
ON public.filter_items FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for filter icons
CREATE POLICY "Anyone can view filter icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'filter-icons');

CREATE POLICY "Admins can upload filter icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'filter-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update filter icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'filter-icons' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete filter icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'filter-icons' AND has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_filter_categories_updated_at
BEFORE UPDATE ON public.filter_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_filter_items_updated_at
BEFORE UPDATE ON public.filter_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.filter_categories (name, display_name, icon_color, sort_order) VALUES
('tier', 'Tier', '#f59e0b', 1),
('affinity', 'Affinity', '#3b82f6', 2),
('class', 'Class', '#ec4899', 3);

-- Insert default tier items
INSERT INTO public.filter_items (category_id, name, display_name, sort_order)
SELECT id, '0', 'Tier 0', 0 FROM public.filter_categories WHERE name = 'tier'
UNION ALL
SELECT id, '1', 'Tier 1', 1 FROM public.filter_categories WHERE name = 'tier'
UNION ALL
SELECT id, '2', 'Tier 2', 2 FROM public.filter_categories WHERE name = 'tier'
UNION ALL
SELECT id, '3', 'Tier 3', 3 FROM public.filter_categories WHERE name = 'tier'
UNION ALL
SELECT id, '4', 'Tier 4', 4 FROM public.filter_categories WHERE name = 'tier'
UNION ALL
SELECT id, '5', 'Tier 5', 5 FROM public.filter_categories WHERE name = 'tier';

-- Insert default affinity items
INSERT INTO public.filter_items (category_id, name, display_name, sort_order)
SELECT id, 'Earth', 'Earth', 0 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Water', 'Water', 1 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Air', 'Air', 2 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Fire', 'Fire', 3 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Nature', 'Nature', 4 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Ice', 'Ice', 5 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Poison', 'Poison', 6 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Psychic', 'Psychic', 7 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Rock', 'Rock', 8 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Steel', 'Steel', 9 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Shadow', 'Shadow', 10 FROM public.filter_categories WHERE name = 'affinity'
UNION ALL
SELECT id, 'Light', 'Light', 11 FROM public.filter_categories WHERE name = 'affinity';

-- Insert default class items
INSERT INTO public.filter_items (category_id, name, display_name, sort_order)
SELECT id, 'Fighter', 'Fighter', 0 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Empath', 'Empath', 1 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Rogue', 'Rogue', 2 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Psion', 'Psion', 3 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Invoker', 'Invoker', 4 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Bulwark', 'Bulwark', 5 FROM public.filter_categories WHERE name = 'class'
UNION ALL
SELECT id, 'Slayer', 'Slayer', 6 FROM public.filter_categories WHERE name = 'class';