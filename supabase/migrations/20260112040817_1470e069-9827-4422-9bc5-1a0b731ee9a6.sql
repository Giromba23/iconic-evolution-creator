-- Add video_url field to stages in evolution_entries
-- Since stages is a JSONB array, we'll document that each stage can have a video_url field
-- The structure will be: { ..., video_url: "https://youtube.com/embed/..." }

-- Add a comment to document the expected JSONB structure
COMMENT ON COLUMN evolution_entries.stages IS 'Array of evolution stages. Each stage object can contain: id, name, imageUrl, link, tier, stage, types (array), description, video_url (optional YouTube/video embed URL)';