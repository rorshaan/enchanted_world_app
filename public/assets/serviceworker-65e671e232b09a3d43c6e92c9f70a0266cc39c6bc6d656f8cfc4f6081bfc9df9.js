var CACHE_VERSION = 'v1';
var CACHE_NAME = CACHE_VERSION + ':sw-cache-';

function onInstall(event) {
  console.log('[Serviceworker]', "Installing!", event);
  event.waitUntil(
    caches.open(CACHE_NAME).then(function prefill(cache) {
      return cache.addAll([

        // make sure serviceworker.js is not required by application.js
        // if you want to reference application.js from here
        '',

        '/assets/application-dd5020f8d01aafa00b26427a27bbf715a12dcb36091f7f591a536c9c15c9dec0.css',

        '/offline.html',

      ]);
    })
  );
}

function onActivate(event) {
  console.log('[Serviceworker]', "Activating!", event);
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
          return cacheName.indexOf(CACHE_VERSION) !== 0;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
}

// Borrowed from https://github.com/TalAter/UpUp
function onFetch(event) {
  event.respondWith(
    // try to return untouched request from network first
    fetch(event.request).catch(function() {
      // if it fails, try to return request from the cache
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        // if not found in cache, return default offline content for navigate requests
        if (event.request.mode === 'navigate' ||
          (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
          console.log('[Serviceworker]', "Fetching offline content", event);
          return caches.match('/offline.html');
        }
      })
    })
  );
}

// serviceworker.js
// The serviceworker context can respond to 'push' events and trigger
// notifications on the registration property
self.addEventListener("push", (event) => {
  let title = (event.data && event.data.text()) || "Yay a message";
  let body = "We have received a push message";
  let tag = "push-simple-demo-notification-tag";
  let icon = '/assets/my-logo-120x120.png';

  event.waitUntil(
    self.registration.showNotification(title, { body, icon, tag })
  )
});

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);
