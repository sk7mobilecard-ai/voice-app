/* VOICE AGENT 20 — offline app shell.
   정적 자산은 캐시 우선, 화면(index.html)은 네트워크 우선으로 받아
   업데이트와 오프라인 실행을 동시에 만족시킵니다. */
var VERSION = "2.0.0";
var CACHE = "voice-agent-20-v" + VERSION;
var PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./README.md",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png",
  "./assets/avatars/minjun-256.webp",
  "./assets/avatars/taeo-256.webp",
  "./assets/avatars/hajun-256.webp",
  "./assets/avatars/dohyun-256.webp",
  "./assets/avatars/seongho-256.webp",
  "./assets/avatars/junseo-256.webp",
  "./assets/avatars/jaehyun-256.webp",
  "./assets/avatars/woojin-256.webp",
  "./assets/avatars/minhyuk-256.webp",
  "./assets/avatars/eunho-256.webp",
  "./assets/avatars/seoyeon-256.webp",
  "./assets/avatars/jiwoo-256.webp",
  "./assets/avatars/haeun-256.webp",
  "./assets/avatars/yujin-256.webp",
  "./assets/avatars/sera-256.webp",
  "./assets/avatars/dain-256.webp",
  "./assets/avatars/narae-256.webp",
  "./assets/avatars/soyul-256.webp",
  "./assets/avatars/yuna-256.webp",
  "./assets/avatars/byeolha-256.webp"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) { return caches.delete(k); }
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") { return; }
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) { return; }

  /* 앱 화면(내비게이션): 네트워크 우선, 실패하면 캐시된 첫 화면 */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
        return res;
      }).catch(function () {
        return caches.match("./index.html").then(function (hit) {
          return hit || caches.match("./");
        });
      })
    );
    return;
  }

  /* 그 밖의 자산: 캐시 우선 */
  event.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) { return hit; }
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
