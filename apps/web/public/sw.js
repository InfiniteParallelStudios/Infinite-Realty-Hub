// Service Worker for Infinite Realty Hub PWA
const CACHE_NAME = 'infinite-realty-hub-v1'
const STATIC_CACHE_NAME = 'infinite-realty-hub-static-v1'
const DYNAMIC_CACHE_NAME = 'infinite-realty-hub-dynamic-v1'

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/contacts',
  '/settings',
  '/auth/signin',
  '/manifest.json',
  '/favicon.ico'
]

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/contacts/,
  /\/api\/auth/,
  /\/api\/user/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('💾 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle authentication requests
  if (url.pathname.startsWith('/auth/')) {
    event.respondWith(handleAuthRequest(request))
    return
  }
  
  // Handle static assets and pages
  event.respondWith(handleStaticRequest(request))
})

// API Request Handler - Network First with Fallback
async function handleApiRequest(request) {
  try {
    // Try network first for API requests
    const networkResponse = await fetch(request)
    
    // If successful, cache the response for API endpoints we care about
    if (networkResponse.ok && shouldCacheApiRequest(request)) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔄 Network failed for API request, checking cache:', request.url)
    
    // Try to get from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      console.log('💾 Serving API request from cache:', request.url)
      return cachedResponse
    }
    
    // Return offline response for API failures
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Auth Request Handler - Network Only
async function handleAuthRequest(request) {
  try {
    return await fetch(request)
  } catch (error) {
    // Redirect to cached signin page if offline
    if (request.url.includes('/auth/')) {
      const cachedSignin = await caches.match('/auth/signin')
      if (cachedSignin) {
        return cachedSignin
      }
    }
    
    throw error
  }
}

// Static Request Handler - Cache First with Network Fallback
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      console.log('💾 Serving from cache:', request.url)
      
      // Update cache in background for HTML pages
      if (request.destination === 'document') {
        fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse)
            })
          }
        }).catch(() => {
          // Ignore network errors in background update
        })
      }
      
      return cachedResponse
    }
    
    // If not in cache, try network
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔄 Network failed for static request:', request.url)
    
    // For navigation requests, try to return a cached page or offline page
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/dashboard') || 
                         await caches.match('/') ||
                         await createOfflinePage()
      return offlinePage
    }
    
    throw error
  }
}

// Helper function to determine if API request should be cached
function shouldCacheApiRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url)) &&
         request.method === 'GET'
}

// Create a basic offline page
function createOfflinePage() {
  const offlineHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Infinite Realty Hub</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #000811 0%, #001122 50%, #000d1a 100%);
          color: white;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 40px 20px;
          border-radius: 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          backdrop-filter: blur(16px);
        }
        h1 { color: #00d4ff; margin-bottom: 16px; }
        p { margin-bottom: 24px; opacity: 0.8; }
        button {
          background: #00d4ff;
          color: #000811;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover { background: #00b8d4; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You're Offline</h1>
        <p>Infinite Realty Hub is currently offline. Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `
  
  return new Response(offlineHtml, {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  console.log('🔄 Performing background sync...')
  
  try {
    // Sync any pending data when connection is restored
    // This is where you'd sync offline actions like:
    // - Saved contacts
    // - Draft messages
    // - Cached form data
    
    console.log('✅ Background sync completed')
  } catch (error) {
    console.error('❌ Background sync failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Infinite Realty Hub', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

console.log('✅ Service Worker loaded successfully')