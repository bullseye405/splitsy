# 📱 Progressive Web App (PWA)

**Status:** 📋 Planned  
**Priority:** 🔵 Medium-Priority  
**Estimated Time:** 3-4 days  
**Dependencies:** Service worker, Manifest file

## 📝 **Overview**

Transform the expense splitter into a Progressive Web App (PWA) to provide app-like experience with offline functionality, installability, and push notifications.

## 🎯 **Goals**

1. **Installable App:** Users can install the app on their devices
2. **Offline Functionality:** Basic functionality without internet
3. **App-like Experience:** Native app feel in browser
4. **Push Notifications:** Enable notification features

## 🔧 **Technical Implementation**

### **PWA Manifest**

```json
// public/manifest.json
{
  "name": "CashPaw - Expense Splitter",
  "short_name": "CashPaw",
  "description": "A cute and user-friendly expense splitting app for groups",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#F59E0B",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["finance", "productivity", "utilities"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### **Service Worker**

```typescript
// public/sw.js
const CACHE_NAME = 'cashpaw-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('CashPaw', options)
  );
});
```

### **PWA Hook**

```typescript
// src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    // Check if app is already installed
    setIsInstalled(window.navigator.standalone === true || 
                   window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as PWAInstallPrompt);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  return {
    installPrompt,
    isInstalled,
    isStandalone,
    canInstall: !!installPrompt,
    installApp
  };
}
```

### **Install Banner Component**

```typescript
// src/components/InstallBanner.tsx
import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function InstallBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { canInstall, installApp } = usePWA();

  if (!canInstall || dismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <div>
            <h3 className="font-semibold">Install CashPaw</h3>
            <p className="text-sm text-muted-foreground">
              Get the full app experience
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={installApp} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### **Offline Page**

```html
<!-- public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CashPaw - Offline</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f59e0b, #ec4899);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .paw-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .retry-btn {
      background: white;
      color: #f59e0b;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .retry-btn:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="paw-icon">🐾</div>
  <h1>You're Offline</h1>
  <p>CashPaw needs an internet connection to sync your expenses.<br>
     Check your connection and try again.</p>
  <button class="retry-btn" onclick="window.location.reload()">
    Try Again
  </button>
</body>
</html>
```

## 📱 **Implementation Steps**

1. **Manifest Setup**
   - [ ] Create manifest.json file
   - [ ] Generate app icons in all sizes
   - [ ] Add manifest link to HTML
   - [ ] Create app screenshots

2. **Service Worker**
   - [ ] Implement service worker
   - [ ] Add offline caching strategy
   - [ ] Handle background sync
   - [ ] Setup push notification handling

3. **PWA Components**
   - [ ] Create PWA detection hook
   - [ ] Build install banner component
   - [ ] Add offline indicator
   - [ ] Implement offline page

4. **Integration**
   - [ ] Register service worker
   - [ ] Add install banner to app
   - [ ] Test offline functionality
   - [ ] Implement push notifications

5. **Testing & Optimization**
   - [ ] Test on multiple devices
   - [ ] Validate PWA criteria
   - [ ] Optimize cache strategy
   - [ ] Test install flow

## ✅ **Testing Checklist**

- [ ] App can be installed from browser
- [ ] App works offline with cached content
- [ ] Install banner appears appropriately
- [ ] Service worker registers successfully
- [ ] Offline page displays when needed
- [ ] Push notifications work (if implemented)
- [ ] App icons display correctly
- [ ] Lighthouse PWA score > 90

## 🔗 **Resources**

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [PWA Manifest Generator](https://www.simicart.com/manifest-generator.html/)
- [Icon Generator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox for Service Workers](https://developers.google.com/web/tools/workbox)

## 💡 **Future Enhancements**

- Background sync for offline expense creation
- Advanced caching strategies
- App shortcuts for quick actions
- Web Share API integration
- File handling for receipt uploads
- Periodic background sync
- App badge for unread notifications

---

**Files to Create/Modify:**
- `public/manifest.json` (new)
- `public/sw.js` (new)
- `public/offline.html` (new)
- `src/hooks/usePWA.ts` (new)
- `src/components/InstallBanner.tsx` (new)
- `public/index.html` (add manifest link)
- Icon files in various sizes
