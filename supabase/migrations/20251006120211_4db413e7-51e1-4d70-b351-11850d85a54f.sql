-- Add group_category column to filter_categories to support Primary, Composite Affinity, and Composite Class grouping
ALTER TABLE filter_categories ADD COLUMN IF NOT EXISTS group_category TEXT;

-- Update existing categories with group_category
UPDATE filter_categories SET group_category = 'primary' WHERE name IN ('tier', 'affinity', 'class');

-- Create view or helper to organize filters into the 3 main groups for the UI
COMMENT ON COLUMN filter_categories.group_category IS 'Groups categories into: primary, composite_affinity, or composite_class';