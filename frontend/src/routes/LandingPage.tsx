import { Link, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/api'

export function LandingPage() {
  const [params] = useSearchParams()
  const campaignId = params.get('c') ?? 'demo'
  const scanId = params.get('u') ?? 'scan-demo'

  return (
    <section className="container-narrow py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-300">
          Malaysia • In-store QR → Social Share
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-emerald-300">
          Ready to Share
        </h1>
        <p className="text-neutral-300">
          Campaign: <span className="font-mono">{campaignId}</span> • Scan: <span className="font-mono">{scanId}</span>
        </p>
      </div>

      <div className="mt-8 grid gap-8">
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-brand-500/10">
          <img src={`https://picsum.photos/seed/${campaignId}/800/600`} alt="Preview" className="w-full aspect-video object-cover" />
        </div>
        <p className="text-neutral-200 bg-neutral-900/60 border border-white/10 rounded-xl p-4">
          Default caption for campaign <span className="font-semibold">{campaignId}</span>. Edit on the next screen.
        </p>

        {/* QR block */}
        <QrBlock campaignId={campaignId} scanId={scanId} />
      </div>

      <div className="mt-10 flex justify-center">
        <Link to={`/share?c=${encodeURIComponent(campaignId)}&u=${encodeURIComponent(scanId)}`} className="inline-flex items-center justify-center rounded-xl px-5 py-3 bg-brand-500 hover:bg-brand-400 text-neutral-950 font-semibold">
          Continue →
        </Link>
      </div>
    </section>
  )
}

function QrBlock({ campaignId, scanId }: { campaignId: string; scanId: string }) {
  const [lanHost, setLanHost] = useState<string | null>(null)

  useEffect(() => {
    let closed = false
    fetch(`${API_BASE}/api/lan`).then(async r => {
      const data = await r.json().catch(() => null)
      if (closed || !data || !Array.isArray(data.ipv4) || data.ipv4.length === 0) return
      const ip = data.ipv4[0]?.address
      if (ip) setLanHost(ip)
    }).catch(() => {})
    return () => { closed = true }
  }, [])

  const origin = useMemo(() => {
    if (lanHost) return `http://${lanHost}:5173`
    if (typeof window !== 'undefined') return window.location.origin
    return 'http://localhost:5173'
  }, [lanHost])

  const url = `${origin}/?c=${encodeURIComponent(campaignId)}&u=${encodeURIComponent(scanId)}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`

  async function downloadQR() {
    const res = await fetch(qrSrc)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = `qr-${campaignId}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-5">
      <div className="flex flex-col items-center gap-4">
        <img src={qrSrc} alt="QR to this page" className="rounded-lg bg-white p-2 border border-white/10" />
        <p className="text-sm text-neutral-300 text-center">
          Scan to open this page on another device. You can also download the QR.
        </p>
        <button onClick={downloadQR} className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-neutral-800 border border-white/10 hover:bg-neutral-700">
          Download QR
        </button>
      </div>
    </div>
  )
}


