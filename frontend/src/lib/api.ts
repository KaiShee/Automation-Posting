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

export interface ImageItem {
  id: string
  url: string
  alt: string
  selected: boolean
}

export type CampaignResponse = {
  id: string
  name: string
  caption: string
  imageUrl: string
  images?: ImageItem[]
  share: string[]
  scan?: string
}

export async function fetchCampaign(campaignId: string, scanId: string): Promise<CampaignResponse> {
  const url = `${API_BASE}/api/campaigns/${encodeURIComponent(campaignId)}?scan=${encodeURIComponent(scanId)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch campaign: ${res.status}`)
  const campaign = await res.json()
  
  // Fetch dynamic images from folder
  try {
    const imagesRes = await fetch(`${API_BASE}/api/campaigns/${encodeURIComponent(campaignId)}/images`)
    if (imagesRes.ok) {
      const { images } = await imagesRes.json()
      if (images && images.length > 0) {
        campaign.images = images
        campaign.imageUrl = images[0]?.url || campaign.imageUrl
      }
    }
  } catch (error) {
    console.warn('Failed to fetch dynamic images:', error)
  }
  
  return campaign
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

export async function downloadImagesAsZip(campaignId: string, imageIds: string[]) {
  const url = `${API_BASE}/api/download/${encodeURIComponent(campaignId)}?images=${imageIds.join(',')}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download images: ${res.status}`)
  
  const blob = await res.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `${campaignId}-images.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(downloadUrl)
}


