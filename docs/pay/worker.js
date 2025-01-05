const version = "1.0.3";
const cts = "Sun Jan  5 15:37:39 CET 2025";
const CACHE_NAME = "qr-pay";
const toCache = [
  ".",
  "images/icon.png",
  "index.html",
  "js/html5-qrcode.min.js",
  "js/mqtt_connect.js",
  "js/namegen.js",
  "js/qrcode.mjs",
  "js/script.js",
  "js/spayd.umd.min.js",
  "js/tesseract.js",
  "style.css",
]; // toCache
self.addEventListener("install", function (event) {
  console.log("used to register the service worker");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log(toCache);
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
  console.log("this event triggers when the service worker activates");
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[ServiceWorker] Removing old cache", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
