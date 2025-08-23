import { Link, useSearchParams } from 'react-router-dom'

export function ThankYouPage() {
  const [params] = useSearchParams()
  const campaignId = params.get('c') ?? 'demo'

  return (
    <section className="container-narrow py-16 text-center space-y-6">
      <h1 className="text-3xl font-bold">Thank you!</h1>
      <p className="text-neutral-300">We appreciate your post. Show this screen to staff to claim any rewards.</p>
      <div className="flex justify-center">
        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('reward:' + campaignId)}`} alt="Reward QR" className="rounded-lg border border-white/10 bg-white p-2" />
      </div>
      <div>
        <Link to="/" className="inline-flex items-center justify-center rounded-lg px-5 py-3 bg-neutral-800 border border-white/10 hover:bg-neutral-700">Back to Home</Link>
      </div>
    </section>
  )
}



