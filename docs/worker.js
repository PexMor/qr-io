const version = "1.0.1";
const cts = "Tue Oct 31 18:39:51 UTC 2023";
const CACHE_NAME = "pers-agent";
const toCache = [
  ".",
  "html5-qrcode.min.js",
  "images/icon-512.png",
  "images/icon-512_bg.png",
  "images/icon-512_bgp.png",
  "index.html",
  "namegen.js",
  "qrcode.min.js",
  "script.js",
  "site.css",
  "twilio.min.js",
]; // toCache
self.addEventListener("install", function (event) {
  // console.log("used to register the service worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // console.log(toCache);
        return cache.addAll(toCache);
      })
      .then(self.skipWaiting())
  );
});
self.addEventListener("fetch", function (event) {
  // console.log(
  //   "used to intercept requests so we can check for the file or data in the cache"
  // );
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request);
      });
    })
  );
});
self.addEventListener("activate", function (event) {
  // console.log("this event triggers when the service worker activates");
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              // console.log("[ServiceWorker] Removing old cache", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
