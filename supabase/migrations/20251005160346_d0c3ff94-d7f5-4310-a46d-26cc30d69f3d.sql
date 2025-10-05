-- Update storage policies to allow authenticated users to upload icons
DROP POLICY IF EXISTS "Admins can upload filter icons" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update filter icons" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete filter icons" ON storage.objects;

DROP POLICY IF EXISTS "Admins can insert filter categories" ON public.filter_categories;
DROP POLICY IF EXISTS "Admins can update filter categories" ON public.filter_categories;
DROP POLICY IF EXISTS "Admins can delete filter categories" ON public.filter_categories;

DROP POLICY IF EXISTS "Admins can insert filter items" ON public.filter_items;
DROP POLICY IF EXISTS "Admins can update filter items" ON public.filter_items;
DROP POLICY IF EXISTS "Admins can delete filter items" ON public.filter_items;

-- New policies for authenticated users
CREATE POLICY "Authenticated users can upload filter icons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'filter-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update filter icons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'filter-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete filter icons"
ON storage.objects FOR DELETE
USING (bucket_id = 'filter-icons' AND auth.role() = 'authenticated');

-- Update table policies for authenticated users
CREATE POLICY "Authenticated users can insert filter categories"
ON public.filter_categories FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update filter categories"
ON public.filter_categories FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete filter categories"
ON public.filter_categories FOR DELETE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert filter items"
ON public.filter_items FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update filter items"
ON public.filter_items FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete filter items"
ON public.filter_items FOR DELETE
USING (auth.role() = 'authenticated');