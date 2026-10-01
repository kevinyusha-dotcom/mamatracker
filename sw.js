// ママトラカ service worker: shows lock-screen alerts sent by the helper.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

async function settings() {
  try {
    const c = await caches.open("mama-settings");
    const r = await c.match("./settings.json");
    return r ? await r.json() : {};
  } catch (e) { return {}; }
}

self.addEventListener("push", e => {
  e.waitUntil((async () => {
    const s = await settings();
    let title = s.lang === "ja" ? "🚌 ママトラカ" : "🚌 ママトラカ", body = s.lang === "ja" ? "バスの最新情報" : "Bus update";
    try {
      if (s.helper) {
        const r = await fetch(s.helper.replace(/\/$/, "") + "/latest?lang=" + (s.lang === "ja" ? "ja" : "en"), { cache: "no-store" });
        const m = await r.json();
        if (m && m.title) { title = m.title; body = m.body || ""; }
      }
    } catch (err) {}
    await self.registration.showNotification(title, { body, tag: "mama-bus", renotify: true, icon: "icon-180.png", badge: "icon-180.png" });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (all.length) { all[0].focus(); return; }
    await self.clients.openWindow(self.registration.scope);
  })());
});
