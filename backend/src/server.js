import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import { createClient } from '@supabase/supabase-js'
import os from 'os'

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


