import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { createClient } from '@supabase/supabase-js'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { createReadStream, writeFile } from 'fs'
import multer from 'multer'
import archiver from 'archiver'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4000
const ORIGIN = process.env.CORS_ORIGIN || '*'

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://cybwthrumtimvyqxduxw.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5Ynd0aHJ1bXRpbXZ5cXhkdXh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk0Nzc2MSwiZXhwIjoyMDcxNTIzNzYxfQ.xEhop811zsxgq0ZHs1AZ2MZ4FJ1_uzZwfiX-IkwKp7E'
const supabase = createClient(supabaseUrl, supabaseKey)

app.use(cors({ origin: ORIGIN }))
app.use(express.json({ limit: '1mb' }))

// Initialize database tables
async function initDatabase() {
  try {
    // Create campaigns table
    const { error: campaignsError } = await supabase.rpc('create_campaigns_table')
    if (campaignsError && !campaignsError.message.includes('already exists')) {
      console.log('Creating campaigns table...')
      await supabase.rpc('create_campaigns_table')
    }

    // Create events table
    const { error: eventsError } = await supabase.rpc('create_events_table')
    if (eventsError && !eventsError.message.includes('already exists')) {
      console.log('Creating events table...')
      await supabase.rpc('create_events_table')
    }

    // Seed demo campaign
    const { data: existingCampaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', 'demo')
      .single()

    if (!existingCampaign) {
      console.log('Seeding demo campaign...')
      await supabase.from('campaigns').insert({
        id: 'demo',
        name: 'Demo Campaign',
        caption: 'Loving this! #YourBrand #Malaysia',
        imageUrl: 'https://picsum.photos/seed/demo/1080/1350',
        images: [
          {
            id: 'img1',
            url: 'https://picsum.photos/seed/demo1/1080/1350',
            alt: 'Product Image 1',
            selected: true
          },
          {
            id: 'img2', 
            url: 'https://picsum.photos/seed/demo2/1080/1350',
            alt: 'Product Image 2',
            selected: false
          },
          {
            id: 'img3',
            url: 'https://picsum.photos/seed/demo3/1080/1350', 
            alt: 'Product Image 3',
            selected: false
          }
        ],
        share: ['instagram', 'facebook', 'whatsapp', 'tiktok', 'xhs'],
        created_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Database init error:', error.message)
  }
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

// Debug endpoint to check images folder
app.get('/api/debug/images/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params
    const imagesFolder = path.join(__dirname, '..', 'images', campaignId)
    
    const debug = {
      campaignId,
      imagesFolder,
      folderExists: false,
      files: [],
      imageFiles: [],
      error: null
    }
    
    try {
      await fs.access(imagesFolder)
      debug.folderExists = true
      
      const files = await fs.readdir(imagesFolder)
      debug.files = files
      
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase()
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
      })
      debug.imageFiles = imageFiles
      
    } catch (error) {
      debug.error = error.message
    }
    
    res.json(debug)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lan', (req, res) => {
  const nics = os.networkInterfaces()
  const ipv4 = []
  for (const name of Object.keys(nics)) {
    for (const info of nics[name] || []) {
      if (info.family === 'IPv4' && !info.internal) {
        ipv4.push({ iface: name, address: info.address })
      }
    }
  }
  res.json({ ipv4 })
})

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const id = req.params.id
    const scan = req.query.scan || nanoid()
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' })
    }

    res.json({ ...campaign, scan })
  } catch (error) {
    console.error('Campaign fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/events', async (req, res) => {
  try {
    const { type, app: appName, campaignId, scan, meta } = req.body || {}
    if (!type || !campaignId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const record = {
      id: nanoid(),
      type,
      app: appName,
      campaign_id: campaignId,
      scan,
      meta: meta || {},
      ip: req.ip,
      user_agent: req.get('user-agent'),
      created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('events').insert(record)
    if (error) {
      console.error('Event insert error:', error)
      return res.status(500).json({ error: 'Failed to save event' })
    }

    res.json({ ok: true, id: record.id })
  } catch (error) {
    console.error('Event creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/events', async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Events fetch error:', error)
      return res.status(500).json({ error: 'Failed to fetch events' })
    }

    res.json({ count: events?.length || 0, events: events || [] })
  } catch (error) {
    console.error('Events fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Add new endpoint to get all images from folder
app.get('/api/campaigns/:id/images', async (req, res) => {
  try {
    const id = req.params.id
    const imagesFolder = path.join(__dirname, '..', 'images', id)
    
    // Check if folder exists
    try {
      await fs.access(imagesFolder)
    } catch {
      // Folder doesn't exist, return empty array
      return res.json({ images: [] })
    }
    
    // Read all files from the folder
    const files = await fs.readdir(imagesFolder)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })
    
    // Create image objects
    const images = imageFiles.map((file, index) => {
      const ext = path.extname(file)
      const name = path.basename(file, ext)
      return {
        id: `img${index + 1}`,
        url: `/api/images/${id}/${encodeURIComponent(file)}`,
        alt: name.replace(/[-_]/g, ' '),
        selected: index === 0, // First image selected by default
        filename: file
      }
    })
    
    res.json({ images })
  } catch (error) {
    console.error('Images fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Serve images from folder
app.get('/api/images/:campaignId/:filename', async (req, res) => {
  try {
    const { campaignId, filename } = req.params
    const imagePath = path.join(__dirname, '..', 'images', campaignId, decodeURIComponent(filename))
    
    // Check if file exists
    try {
      await fs.access(imagePath)
    } catch {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    // Set proper headers for image serving
    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    
    // Stream the file
    const stream = createReadStream(imagePath)
    stream.pipe(res)
  } catch (error) {
    console.error('Image serve error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const campaignId = req.params.campaignId
    const uploadDir = path.join(__dirname, '..', 'images', campaignId)
    
    try {
      await fs.mkdir(uploadDir, { recursive: true })
      cb(null, uploadDir)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    // Keep original filename but sanitize it
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, sanitizedName)
  }
})

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'))
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Upload images endpoint
app.post('/api/upload/:campaignId', upload.array('images', 10), async (req, res) => {
  try {
    const { campaignId } = req.params
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    
    const uploadedFiles = req.files.map(file => file.filename)
    
    res.json({ 
      message: `Successfully uploaded ${uploadedFiles.length} image(s)`,
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// Delete image endpoint
app.delete('/api/images/:campaignId/:filename', async (req, res) => {
  try {
    const { campaignId, filename } = req.params
    const imagePath = path.join(__dirname, '..', 'images', campaignId, decodeURIComponent(filename))
    
    // Check if file exists
    try {
      await fs.access(imagePath)
    } catch {
      return res.status(404).json({ error: 'Image not found' })
    }
    
    // Delete the file
    await fs.unlink(imagePath)
    
    res.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

// Download multiple images as zip
app.get('/api/download/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params
    const { images } = req.query // Comma-separated image IDs
    
    if (!images) {
      return res.status(400).json({ error: 'No images specified' })
    }
    
    const imageIds = images.split(',')
    const imagesFolder = path.join(__dirname, '..', 'images', campaignId)
    
    // Check if folder exists
    try {
      await fs.access(imagesFolder)
    } catch {
      return res.status(404).json({ error: 'Campaign images not found' })
    }
    
    // Get all image files
    const files = await fs.readdir(imagesFolder)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    })
    
    // Filter selected images
    const selectedImages = imageFiles.filter((_, index) => 
      imageIds.includes(`img${index + 1}`)
    )
    
    if (selectedImages.length === 0) {
      return res.status(400).json({ error: 'No valid images selected' })
    }
    
    // Create zip file
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    })
    
    // Set response headers
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${campaignId}-images.zip"`)
    
    // Pipe archive to response
    archive.pipe(res)
    
    // Add files to archive
    for (const filename of selectedImages) {
      const filePath = path.join(imagesFolder, filename)
      archive.file(filePath, { name: filename })
    }
    
    // Finalize the archive
    await archive.finalize()
    
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
    console.log('Database initialized successfully')
  })
}).catch(error => {
  console.error('Failed to initialize database:', error)
  process.exit(1)
})


