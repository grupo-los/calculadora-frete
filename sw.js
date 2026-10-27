// Ao publicar uma versão nova, troque o número abaixo (v1 -> v2...) para os celulares atualizarem.
const VERSAO = 'frete-los-v3';
const ARQUIVOS = [
  './', 'index.html', 'manifest.webmanifest', 'logo.png', 'fundo.jpg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png', 'icons/favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tenta a internet primeiro (pega a versão mais nova); sem internet, usa a cópia salva.
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if(resp.ok && new URL(e.request.url).origin === location.origin){
          const copia = resp.clone();
          caches.open(VERSAO).then(c => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
