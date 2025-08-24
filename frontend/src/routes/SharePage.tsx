import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchCampaign, postEvent, downloadImagesAsZip } from '../lib/api'

const DEFAULT_CAPTION = 'Loving this! #YourBrand #Malaysia'

interface ImageItem {
  id: string
  url: string
  alt: string
  selected: boolean
}

interface Campaign {
  id: string
  name: string
  caption: string
  imageUrl: string
  images?: ImageItem[]
  share: string[]
  scan?: string
}

export function SharePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const campaignId = params.get('c') ?? 'demo'
  const scanId = params.get('u') ?? 'scan-demo'
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [caption, setCaption] = useState(DEFAULT_CAPTION)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  useEffect(() => {
    let closed = false
    ;(async () => {
      try {
        const data = await fetchCampaign(campaignId, scanId)
        if (closed) return
        
        setCampaign(data)
        setCaption(data.caption || DEFAULT_CAPTION)
        
        // Set default selected images
        if (data.images) {
          const defaultSelected = data.images
            .filter(img => img.selected)
            .map(img => img.id)
          setSelectedImages(defaultSelected.length > 0 ? defaultSelected : [data.images[0]?.id].filter(Boolean))
        }
      } catch (e: any) {
        setApiError('Using placeholders (API offline)')
        // Fallback to demo data
        setCampaign({
          id: campaignId,
          name: 'Demo Campaign',
          caption: DEFAULT_CAPTION,
          imageUrl: `https://picsum.photos/seed/${campaignId}/1080/1350`,
          images: [
            {
              id: 'img1',
              url: `https://picsum.photos/seed/${campaignId}1/1080/1350`,
              alt: 'Product Image 1',
              selected: true
            },
            {
              id: 'img2',
              url: `https://picsum.photos/seed/${campaignId}2/1080/1350`,
              alt: 'Product Image 2',
              selected: false
            }
          ],
          share: ['instagram', 'facebook', 'whatsapp', 'tiktok', 'xhs'],
          scan: scanId
        })
        setSelectedImages(['img1'])
      } finally {
        if (!closed) setLoading(false)
      }
    })()
    return () => {
      closed = true
    }
  }, [campaignId, scanId])

  const handleImageToggle = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const handleSelectAll = () => {
    if (campaign?.images) {
      setSelectedImages(campaign.images.map(img => img.id))
    }
  }

  const handleDeselectAll = () => {
    setSelectedImages([])
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      postEvent({ type: 'caption_copied', campaignId, scan: scanId }).catch(() => {})
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function handleDownloadSelected() {
    if (selectedImages.length === 0) return
    
    setDownloading(true)
    try {
      // Use zip download for multiple images (better for mobile)
      if (selectedImages.length > 1) {
        await downloadImagesAsZip(campaignId, selectedImages)
      } else {
        // Single image download (original method)
        const selectedImageData = campaign?.images?.filter(img => selectedImages.includes(img.id)) || []
        for (const image of selectedImageData) {
          const res = await fetch(image.url)
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${campaignId}-${image.id}.jpg`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        }
      }
      
      postEvent({ 
        type: 'images_downloaded', 
        campaignId, 
        scan: scanId,
        meta: { count: selectedImages.length, images: selectedImages }
      }).catch(() => {})
    } finally {
      setDownloading(false)
    }
  }

  async function handleWebShare(target?: string) {
    try {
      postEvent({ type: 'share_clicked', app: target, campaignId, scan: scanId }).catch(() => {})
      
      // Enhanced sharing logic
      if (navigator.canShare && navigator.canShare()) {
        // Use Web Share API if available
        const shareData: any = { 
          text: caption,
          url: window.location.origin 
        }
        
        // Add images if supported
        if (navigator.canShare({ files: [] })) {
          const selectedImageData = campaign?.images?.filter(img => selectedImages.includes(img.id)) || []
          if (selectedImageData.length > 0) {
            try {
              const files = await Promise.all(
                selectedImageData.map(async (img) => {
                  const res = await fetch(img.url)
                  const blob = await res.blob()
                  return new File([blob], `${img.id}.jpg`, { type: 'image/jpeg' })
                })
              )
              shareData.files = files
            } catch (e) {
              console.log('Could not prepare files for sharing')
            }
          }
        }
        
        await navigator.share(shareData)
      } else {
        // Fallback to deep links or web sharing
        const shareUrl = getShareUrl(target)
        if (shareUrl) {
          window.open(shareUrl, '_blank')
        }
      }
    } catch (e) {
      console.error('Share failed:', e)
    }
  }

  function getShareUrl(target?: string) {
    const encodedCaption = encodeURIComponent(caption)
    const encodedUrl = encodeURIComponent(window.location.origin)
    
    switch (target) {
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, but we can open the app
        return 'instagram://app'
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedCaption}`
      case 'whatsapp':
        return `https://api.whatsapp.com/send?text=${encodedCaption}%20${encodedUrl}`
      case 'tiktok':
        // TikTok doesn't support direct sharing via URL
        return 'snssdk1233://'
      case 'xhs':
        // XHS doesn't support direct sharing via URL
        return 'xhsdiscover://'
      default:
        return null
    }
  }

  function complete() {
    postEvent({ type: 'share_completed', campaignId, scan: scanId }).catch(() => {})
    navigate(`/thanks?c=${encodeURIComponent(campaignId)}&u=${encodeURIComponent(scanId)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500">Campaign not found.</p>
          <Link to="/" className="text-green-400 hover:text-green-300 underline mt-4 block">
            Go back to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="container-narrow py-8 space-y-6">
      <Link to={`/`} className="text-sm text-neutral-400 hover:text-white">← Back</Link>

      <div className="grid gap-6">
        {/* Multiple Images Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Select Images to Download</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {campaign.images?.map((image) => (
              <div key={image.id} className="relative">
                <div 
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImages.includes(image.id) 
                      ? 'border-green-400 ring-2 ring-green-400/50' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                  onClick={() => handleImageToggle(image.id)}
                >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full aspect-[4/5] object-cover"
                  />
                  {selectedImages.includes(image.id) && (
                    <div className="absolute top-2 right-2 bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-center">{image.alt}</p>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 mb-4">
            <button 
              onClick={handleSelectAll}
              className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              Select All
            </button>
            <button 
              onClick={handleDeselectAll}
              className="px-3 py-1 text-xs rounded bg-gray-600 hover:bg-gray-700 text-white"
            >
              Deselect All
            </button>
          </div>
          
          <p className="text-sm text-neutral-300">
            Selected: {selectedImages.length} of {campaign.images?.length || 0} images
          </p>
        </div>

        {/* Caption Section */}
        <div>
          <label className="block text-sm text-neutral-300 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full min-h-[120px] rounded-lg bg-neutral-900 border border-white/10 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
            placeholder="Write your caption here..."
          />
          {apiError && (
            <p className="mt-2 text-xs text-amber-300">{apiError}</p>
          )}
          <div className="mt-3 flex gap-3 flex-wrap">
            <button 
              onClick={handleCopy} 
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700 text-white"
            >
              {copied ? 'Copied!' : 'Copy Caption'}
            </button>
            <button 
              onClick={handleDownloadSelected} 
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white" 
              disabled={downloading || selectedImages.length === 0}
            >
              {downloading ? 'Downloading…' : `Download ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* Social Media Sharing */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Share to Social Media</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => handleWebShare('instagram')} 
            className="h-12 rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-400 text-neutral-950 font-semibold hover:opacity-90 transition-opacity"
          >
            Instagram
          </button>
          <button 
            onClick={() => handleWebShare('facebook')} 
            className="h-12 rounded-lg bg-[#0866FF] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Facebook
          </button>
          <button 
            onClick={() => handleWebShare('whatsapp')} 
            className="h-12 rounded-lg bg-[#25D366] text-neutral-950 font-semibold hover:opacity-90 transition-opacity"
          >
            WhatsApp
          </button>
          <button 
            onClick={() => handleWebShare('tiktok')} 
            className="h-12 rounded-lg bg-neutral-100 text-neutral-950 font-semibold hover:opacity-90 transition-opacity"
          >
            TikTok
          </button>
          <button 
            onClick={() => handleWebShare('xhs')} 
            className="h-12 rounded-lg bg-red-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            XHS
          </button>
          <button 
            onClick={complete} 
            className="h-12 rounded-lg bg-green-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </section>
  )
}


