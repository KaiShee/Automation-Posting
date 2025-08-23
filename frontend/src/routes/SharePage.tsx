import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { fetchCampaign, postEvent } from '../lib/api'

const DEFAULT_CAPTION = 'Loving this! #YourBrand #Malaysia'

export function SharePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const campaignId = params.get('c') ?? 'demo'
  const scanId = params.get('u') ?? 'scan-demo'
  const [imageUrl, setImageUrl] = useState(`https://picsum.photos/seed/${campaignId}/1080/1350`)
  const [caption, setCaption] = useState(DEFAULT_CAPTION)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    let closed = false
    ;(async () => {
      try {
        const data = await fetchCampaign(campaignId, scanId)
        if (closed) return
        setCaption(data.caption || DEFAULT_CAPTION)
        setImageUrl(data.imageUrl || `https://picsum.photos/seed/${campaignId}/1080/1350`)
      } catch (e: any) {
        setApiError('Using placeholders (API offline)')
      } finally {
        if (!closed) setLoading(false)
      }
    })()
    return () => {
      closed = true
    }
  }, [campaignId, scanId])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaignId}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleWebShare(target?: string) {
    try {
      postEvent({ type: 'share_clicked', app: target, campaignId, scan: scanId }).catch(() => {})
      if (navigator.canShare && navigator.canShare()) {
        await navigator.share({ text: caption, url: window.location.origin })
      } else {
        window.open(getDeepLink(target), '_blank')
      }
    } catch {}
  }

  function getDeepLink(target?: string) {
    switch (target) {
      case 'instagram':
        return 'instagram://app'
      case 'facebook':
        return 'fb://profile'
      case 'xhs':
        return 'xhsdiscover://'
      case 'tiktok':
        return 'snssdk1233://'
      case 'whatsapp':
        return 'https://api.whatsapp.com/send?text=' + encodeURIComponent(caption)
      default:
        return 'about:blank'
    }
  }

  function complete() {
    postEvent({ type: 'share_completed', campaignId, scan: scanId }).catch(() => {})
    navigate(`/thanks?c=${encodeURIComponent(campaignId)}&u=${encodeURIComponent(scanId)}`)
  }

  return (
    <section className="container-narrow py-8 space-y-6">
      <Link to={`/` } className="text-sm text-neutral-400 hover:text-white">← Back</Link>

      <div className="grid gap-6">
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img src={imageUrl} alt="Preview" className="w-full aspect-[4/5] object-cover" />
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full min-h-[120px] rounded-lg bg-neutral-900 border border-white/10 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {apiError && (
            <p className="mt-2 text-xs text-amber-300">{apiError}</p>
          )}
          <div className="mt-3 flex gap-3">
            <button onClick={handleCopy} className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700">
              {copied ? 'Copied!' : 'Copy Caption'}
            </button>
            <button onClick={handleDownload} className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700" disabled={downloading}>
              {downloading ? 'Downloading…' : 'Download Image'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button onClick={() => handleWebShare('instagram')} className="h-12 rounded-lg bg-gradient-to-br from-fuchsia-500 to-amber-400 text-neutral-950 font-semibold">
          Instagram
        </button>
        <button onClick={() => handleWebShare('facebook')} className="h-12 rounded-lg bg-[#0866FF] text-white font-semibold">
          Facebook
        </button>
        <button onClick={() => handleWebShare('whatsapp')} className="h-12 rounded-lg bg-[#25D366] text-neutral-950 font-semibold">
          WhatsApp
        </button>
        <button onClick={() => handleWebShare('tiktok')} className="h-12 rounded-lg bg-neutral-100 text-neutral-950 font-semibold">
          TikTok
        </button>
        <button onClick={() => handleWebShare('xhs')} className="h-12 rounded-lg bg-red-600 text-white font-semibold">
          XHS
        </button>
        <button onClick={complete} className="h-12 rounded-lg bg-brand-500 text-neutral-950 font-semibold">
          Done
        </button>
      </div>
    </section>
  )
}


