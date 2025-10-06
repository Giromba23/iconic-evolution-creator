-- Create new categories for the proper organization
INSERT INTO filter_categories (name, display_name, icon_color, sort_order, group_category)
VALUES 
  ('primary', 'Primary', '#3b82f6', 2, 'primary'),
  ('composite_affinity', 'Composite Affinity', '#10b981', 3, 'composite_affinity'),
  ('composite_class', 'Composite Class', '#8b5cf6', 4, 'composite_class')
ON CONFLICT (name) DO UPDATE SET
  group_category = EXCLUDED.group_category,
  sort_order = EXCLUDED.sort_order;