import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { API_BASE } from '../lib/api'

interface ImageItem {
  id: string
  url: string
  alt: string
  selected: boolean
  filename: string
}

export function AdminPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const campaignId = params.get('c') ?? 'demo'
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [showDebug, setShowDebug] = useState(false)
  const [debugResults, setDebugResults] = useState<Record<string, any>>({})

  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true'
    const adminCampaign = sessionStorage.getItem('admin_campaign')
    
    if (!isAuthenticated || adminCampaign !== campaignId) {
      navigate(`/admin-login?c=${encodeURIComponent(campaignId)}`)
      return
    }
  }, [campaignId, navigate])

  useEffect(() => {
    loadImages()
  }, [campaignId])

  async function loadImages() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/campaigns/${encodeURIComponent(campaignId)}/images`)
      if (res.ok) {
        const data = await res.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to load images:', error)
      setMessage('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i])
      }

      const res = await fetch(`${API_BASE}/api/upload/${encodeURIComponent(campaignId)}`, {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        setMessage(`Successfully uploaded ${files.length} image(s)`)
        await loadImages() // Reload images
      } else {
        const error = await res.text()
        setMessage(`Upload failed: ${error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteImage(filename: string) {
    if (!confirm(`Delete image "${filename}"?`)) return

    try {
      const res = await fetch(`${API_BASE}/api/images/${encodeURIComponent(campaignId)}/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage('Image deleted successfully')
        await loadImages() // Reload images
      } else {
        setMessage('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      setMessage('Failed to delete image')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_authenticated')
    sessionStorage.removeItem('admin_campaign')
    navigate(`/?c=${encodeURIComponent(campaignId)}`)
  }

  // Debug functions
  async function testBackendHealth() {
    try {
      const response = await fetch(`${API_BASE}/api/health`)
      if (response.ok) {
        const data = await response.json()
        setDebugResults(prev => ({ ...prev, health: { status: 'success', data } }))
      } else {
        setDebugResults(prev => ({ ...prev, health: { status: 'error', error: response.status } }))
      }
    } catch (error) {
      setDebugResults(prev => ({ ...prev, health: { status: 'error', error: error instanceof Error ? error.message : String(error) } }))
    }
  }

  async function debugImagesFolder() {
    try {
      const response = await fetch(`${API_BASE}/api/debug/images/${encodeURIComponent(campaignId)}`)
      if (response.ok) {
        const data = await response.json()
        setDebugResults(prev => ({ ...prev, debug: { status: 'success', data } }))
      } else {
        setDebugResults(prev => ({ ...prev, debug: { status: 'error', error: response.status } }))
      }
    } catch (error) {
      setDebugResults(prev => ({ ...prev, debug: { status: 'error', error: error instanceof Error ? error.message : String(error) } }))
    }
  }

  async function testImagesAPI() {
    try {
      const response = await fetch(`${API_BASE}/api/campaigns/${encodeURIComponent(campaignId)}/images`)
      if (response.ok) {
        const data = await response.json()
        setDebugResults(prev => ({ ...prev, imagesApi: { status: 'success', data } }))
      } else {
        setDebugResults(prev => ({ ...prev, imagesApi: { status: 'error', error: response.status } }))
      }
    } catch (error) {
      setDebugResults(prev => ({ ...prev, imagesApi: { status: 'error', error: error instanceof Error ? error.message : String(error) } }))
    }
  }

  async function testSocialMediaLinks() {
    try {
      const testCaption = "Test caption for social media sharing"
      const testUrl = window.location.origin
      
      const results: Record<string, string | null> = {
        whatsapp: null,
        facebook: null,
        instagram: null,
        tiktok: null,
        xhs: null,
        webShare: null
      }

      // Test Web Share API
      if (navigator.canShare && navigator.canShare()) {
        results.webShare = 'supported'
      } else {
        results.webShare = 'not_supported'
      }

      // Test deep links
      try {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(testCaption)}`, '_blank')
        results.whatsapp = 'opened'
      } catch (e) {
        results.whatsapp = 'failed'
      }

      try {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(testUrl)}`, '_blank')
        results.facebook = 'opened'
      } catch (e) {
        results.facebook = 'failed'
      }

      setDebugResults(prev => ({ 
        ...prev, 
        socialMedia: { 
          status: 'success', 
          data: results 
        } 
      }))
    } catch (error) {
      setDebugResults(prev => ({ 
        ...prev, 
        socialMedia: { 
          status: 'error', 
          error: error instanceof Error ? error.message : String(error) 
        } 
      }))
    }
  }

  async function runAllTests() {
    setDebugResults({})
    await Promise.all([
      testBackendHealth(),
      debugImagesFolder(),
      testImagesAPI(),
      testSocialMediaLinks()
    ])
  }

  return (
    <div className="container-narrow py-10">
      <div className="text-center space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-neutral-800 border border-white/10 hover:bg-neutral-700 text-sm"
          >
            Logout
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-emerald-300">
            Image Manager
          </h1>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>
        <p className="text-neutral-300">
          Campaign: <span className="font-mono">{campaignId}</span>
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.includes('failed') || message.includes('error') 
            ? 'border-red-500/20 bg-red-500/10 text-red-300' 
            : 'border-green-500/20 bg-green-500/10 text-green-300'
        }`}>
          {message}
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
        <h2 className="text-xl font-semibold mb-4">Upload Images</h2>
        <div className="space-y-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-500 file:text-neutral-950 hover:file:bg-brand-400"
          />
          <p className="text-sm text-neutral-400">
            Supported formats: JPG, PNG, GIF, WebP. Images will be automatically optimized.
          </p>
          {uploading && <p className="text-sm text-neutral-300">Uploading...</p>}
        </div>
      </div>

      {/* Images List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Current Images ({images.length})</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-neutral-400">Loading images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-neutral-400">No images uploaded yet.</p>
            <p className="text-sm text-neutral-500 mt-2">Upload some images above to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-neutral-900/60">
                <img 
                  src={image.url} 
                  alt={image.alt}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-200 truncate">{image.filename}</p>
                  <p className="text-sm text-neutral-400">{image.alt}</p>
                  <p className="text-xs text-neutral-500">ID: {image.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    image.selected 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}>
                    {image.selected ? 'Default' : 'Optional'}
                  </span>
                  <button
                    onClick={() => handleDeleteImage(image.filename)}
                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Instructions */}
       <div className="mt-8 p-6 rounded-2xl border border-white/10 bg-neutral-900/60">
         <h3 className="text-lg font-semibold mb-3">How it works</h3>
         <ul className="space-y-2 text-sm text-neutral-300">
           <li>• Upload images to the <code className="bg-neutral-800 px-1 rounded">backend/images/{campaignId}/</code> folder</li>
           <li>• The first image uploaded becomes the default selected image</li>
           <li>• Users can select multiple images and download them as a ZIP file</li>
           <li>• Images are automatically served with proper caching headers</li>
           <li>• Supported formats: JPG, PNG, GIF, WebP</li>
         </ul>
       </div>

       {/* Debug Section */}
       {showDebug && (
         <div className="mt-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5">
           <h3 className="text-lg font-semibold mb-4 text-blue-300">🔧 Debug Tools</h3>
           
           <div className="space-y-4 mb-6">
             <div className="flex gap-2 flex-wrap">
               <button
                 onClick={runAllTests}
                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
               >
                 Run All Tests
               </button>
               <button
                 onClick={testBackendHealth}
                 className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm"
               >
                 Test Backend Health
               </button>
               <button
                 onClick={debugImagesFolder}
                 className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-sm"
               >
                 Debug Images Folder
               </button>
                               <button
                  onClick={testImagesAPI}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-sm"
                >
                  Test Images API
                </button>
                <button
                  onClick={testSocialMediaLinks}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-sm"
                >
                  Test Social Media
                </button>
             </div>
           </div>

           {/* Debug Results */}
           {Object.keys(debugResults).length > 0 && (
             <div className="space-y-4">
               <h4 className="font-semibold text-blue-300">Test Results:</h4>
               
               {debugResults.health && (
                 <div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60">
                   <h5 className="font-medium mb-2">🏥 Backend Health</h5>
                   {debugResults.health.status === 'success' ? (
                     <div className="text-green-300">
                       ✅ Backend is running! 
                       <pre className="mt-2 text-xs bg-neutral-800 p-2 rounded overflow-x-auto">
                         {JSON.stringify(debugResults.health.data, null, 2)}
                       </pre>
                     </div>
                   ) : (
                     <div className="text-red-300">
                       ❌ Backend error: {debugResults.health.error}
                     </div>
                   )}
                 </div>
               )}

               {debugResults.debug && (
                 <div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60">
                   <h5 className="font-medium mb-2">📁 Images Folder Debug</h5>
                   {debugResults.debug.status === 'success' ? (
                     <div className="text-green-300">
                       ✅ Debug info retrieved!
                       <pre className="mt-2 text-xs bg-neutral-800 p-2 rounded overflow-x-auto">
                         {JSON.stringify(debugResults.debug.data, null, 2)}
                       </pre>
                     </div>
                   ) : (
                     <div className="text-red-300">
                       ❌ Debug failed: {debugResults.debug.error}
                     </div>
                   )}
                 </div>
               )}

                               {debugResults.imagesApi && (
                  <div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60">
                    <h5 className="font-medium mb-2">🖼️ Images API</h5>
                    {debugResults.imagesApi.status === 'success' ? (
                      <div className="text-green-300">
                        ✅ Images API working! Found {debugResults.imagesApi.data.images?.length || 0} images
                        <pre className="mt-2 text-xs bg-neutral-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(debugResults.imagesApi.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-red-300">
                        ❌ Images API failed: {debugResults.imagesApi.error}
                      </div>
                    )}
                  </div>
                )}

                {debugResults.socialMedia && (
                  <div className="p-3 rounded-lg border border-white/10 bg-neutral-900/60">
                    <h5 className="font-medium mb-2">📱 Social Media Links</h5>
                    {debugResults.socialMedia.status === 'success' ? (
                      <div className="text-green-300">
                        ✅ Social media links tested!
                        <div className="mt-2 space-y-1 text-xs">
                          <div>Web Share API: <span className={debugResults.socialMedia.data.webShare === 'supported' ? 'text-green-400' : 'text-yellow-400'}>{debugResults.socialMedia.data.webShare}</span></div>
                          <div>WhatsApp: <span className={debugResults.socialMedia.data.whatsapp === 'opened' ? 'text-green-400' : 'text-red-400'}>{debugResults.socialMedia.data.whatsapp}</span></div>
                          <div>Facebook: <span className={debugResults.socialMedia.data.facebook === 'opened' ? 'text-green-400' : 'text-red-400'}>{debugResults.socialMedia.data.facebook}</span></div>
                        </div>
                        <pre className="mt-2 text-xs bg-neutral-800 p-2 rounded overflow-x-auto">
                          {JSON.stringify(debugResults.socialMedia.data, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-red-300">
                        ❌ Social media test failed: {debugResults.socialMedia.error}
                      </div>
                    )}
                  </div>
                )}
             </div>
           )}
         </div>
       )}
     </div>
   )
 }
