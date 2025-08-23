const inferApiBase = () => {
  // If deployed on Vercel, use the same domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('vercel.app') || hostname.includes('yourdomain.com')) {
      return `${window.location.protocol}//${hostname}`
    }
    // Local development
    const protocol = window.location.protocol || 'http:'
    const port = 4000
    return `${protocol}//${hostname}:${port}`
  }
  return 'http://localhost:4000'
}

export const API_BASE = inferApiBase()

export type CampaignResponse = {
  id: string
  name: string
  caption: string
  imageUrl: string
  share: string[]
  scan?: string
}

export async function fetchCampaign(campaignId: string, scanId: string): Promise<CampaignResponse> {
  const url = `${API_BASE}/api/campaigns/${encodeURIComponent(campaignId)}?scan=${encodeURIComponent(scanId)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch campaign: ${res.status}`)
  return res.json()
}

export async function postEvent(payload: {
  type: string
  app?: string
  campaignId: string
  scan?: string
  meta?: Record<string, unknown>
}) {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to post event: ${res.status}`)
  return res.json()
}


