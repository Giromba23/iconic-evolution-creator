-- Open up filters management without auth and allow icon uploads

-- Filter Items: allow anyone to insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can insert filter items" ON public.filter_items;
DROP POLICY IF EXISTS "Authenticated users can update filter items" ON public.filter_items;
DROP POLICY IF EXISTS "Authenticated users can delete filter items" ON public.filter_items;

CREATE POLICY "Anyone can insert filter items"
ON public.filter_items
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update filter items"
ON public.filter_items
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete filter items"
ON public.filter_items
FOR DELETE
TO public
USING (true);

-- Filter Categories: allow anyone to insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can insert filter categories" ON public.filter_categories;
DROP POLICY IF EXISTS "Authenticated users can update filter categories" ON public.filter_categories;
DROP POLICY IF EXISTS "Authenticated users can delete filter categories" ON public.filter_categories;

CREATE POLICY "Anyone can insert filter categories"
ON public.filter_categories
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can update filter categories"
ON public.filter_categories
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Anyone can delete filter categories"
ON public.filter_categories
FOR DELETE
TO public
USING (true);

-- Storage: allow public read/write for the 'filter-icons' bucket
DROP POLICY IF EXISTS "Public can view filter icons" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload filter icons" ON storage.objects;
DROP POLICY IF EXISTS "Public can update filter icons" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete filter icons" ON storage.objects;

CREATE POLICY "Public can view filter icons"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'filter-icons');

CREATE POLICY "Public can upload filter icons"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'filter-icons');

CREATE POLICY "Public can update filter icons"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'filter-icons');

CREATE POLICY "Public can delete filter icons"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'filter-icons');