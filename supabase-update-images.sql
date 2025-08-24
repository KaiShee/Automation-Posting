-- Update campaigns table to add images column
-- Run this in your Supabase SQL Editor

-- Add images column to existing campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;

-- Update existing demo campaign with images data
UPDATE campaigns 
SET images = '[
  {
    "id": "img1",
    "url": "https://picsum.photos/seed/demo1/1080/1350",
    "alt": "Product Image 1",
    "selected": true
  },
  {
    "id": "img2",
    "url": "https://picsum.photos/seed/demo2/1080/1350",
    "alt": "Product Image 2",
    "selected": false
  },
  {
    "id": "img3",
    "url": "https://picsum.photos/seed/demo3/1080/1350",
    "alt": "Product Image 3",
    "selected": false
  }
]'::jsonb
WHERE id = 'demo';

-- Add an index on the images column for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_images ON campaigns USING GIN (images);

-- Verify the update
SELECT id, name, images FROM campaigns WHERE id = 'demo';
