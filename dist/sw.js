"use strict"; var precacheConfig = [["/android-chrome-192x192.png", "e62c0b35937d7f0957d14a23d29e0440"], ["/android-chrome-512x512.png", "013da30a12cf693e8644cad9240734e2"], ["/cache-polyfill.js", "cde61d2d6c29b8da5de5deed688195a4"], ["/css/bootstrap.min.css", "bae3a876fddfd1bd6a20e47e2dc41aa9"], ["/css/style.css", "250cc0f7046836b22896d065ec608b67"], ["/favicon-16x16.png", "7198e03e2024ae4000b801cfc7f9d998"], ["/favicon-32x32.png", "5319f296bd4431a9f57eb232acafc806"], ["/img/bingLogo/bing_maps_logo_gray.png", "753575d6119112dcd3152f6b5b9f6ed0"], ["/img/bingLogo/bing_maps_logo_white.png", "544660a38c7604f85f23899c1145d6fd"], ["/img/hq-lock.png", "7015b434035a0541c32df933b160615f"], ["/img/hq-lock_white.png", "09e90aa31605005acf5cce23fe57bfbf"], ["/img/largeLogo.svg", "8df3cd7556bb52da44856a12abf9d8e3"], ["/img/operationFounder.png", "f46bc942d899117c8c62109f3f5e8d55"], ["/index.html", "780138f5e234d9bd06bff07bfe8a8c6c"], ["/js/JQuery/jquery-3.1.1.min.js", "5d67849e00920cc6ceae64a01913a23b"], ["/js/operationFounder.js", "037382a5926854d5159a46cef394d79a"], ["/js/pouchdb/pouchdb-6.3.4.min.js", "b1ac091655b772e5354545d65f2aaf9f"], ["/js/pouchdb/pouchdb.find.min.js", "26d09484a6e62fdfa93a004d0bdd6c85"], ["/largeLogo.png", "8688891ed84c94e19011c8c4aa70447f"], ["/lib/onsenui/css/font-awesome.css", "cf3894d3ce73ad0e0c52f32435d086fc"], ["/lib/onsenui/css/font_awesome/fonts/FontAwesome.otf", "5dc41d8fe329a22fa1ee9225571c843e"], ["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.eot", "25a32416abee198dd821b0b17a198a8f"], ["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.svg", "46661d6d65debc63884004fed6e37e5c"], ["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.ttf", "1dc35d25e61d819a9c357074014867ab"], ["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff", "c8ddf1e5e5bf3682bc7bebf30f394148"], ["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff2", "e6cf7c6ec7c2d6f670ae9d762604cb0b"], ["/lib/onsenui/css/ionicons.css", "aaf730ce5fd6012094af4c460fe70419"], ["/lib/onsenui/css/ionicons/fonts/ionicons.eot", "19e65b89cee273a249fba4c09b951b74"], ["/lib/onsenui/css/ionicons/fonts/ionicons.svg", "46661d6d65debc63884004fed6e37e5c"], ["/lib/onsenui/css/ionicons/fonts/ionicons.ttf", "dd4781d1acc57ba4c4808d1b44301201"], ["/lib/onsenui/css/ionicons/fonts/ionicons.woff", "2c159d0d05473040b53ec79df8797d32"], ["/lib/onsenui/css/material-design-iconic-font.css", "8ab98ef794842cd328043aa07cb4aa41"], ["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.eot", "e833b2e2471274c238c0553f11031e6a"], ["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.svg", "46661d6d65debc63884004fed6e37e5c"], ["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.ttf", "b351bd62abcd96e924d9f44a3da169a7"], ["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff", "d2a55d331bdd1a7ea97a8a1fbb3c569c"], ["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff2", "a4d31128b633bc0b1cc1f18a34fb3851"], ["/lib/onsenui/css/onsen-css-components-blue-basic-theme.css", "a062ed82c7a9804f0d969c55a4249ea6"], ["/lib/onsenui/css/onsen-css-components.css", "16f86346690130bb591aab3e68422b8f"], ["/lib/onsenui/css/onsenui.css", "55f628550205a3d639123a59062077c2"], ["/lib/onsenui/js/onsenui.js", "99d595a7d2bef8b93ae1f7bac6219d3e"], ["/mstile-150x150.png", "ad2a2b5d1e7afc1528bf8e62f72385d9"], ["/qapple-touch-icon.png", "016fda561bb45596911a3caf85cd81bb"], ["/safari-pinned-tab.svg", "e6d507ba7043dd05d10a6cef11b9ec20"]], cacheName = "sw-precache-v3--" + (self.registration ? self.registration.scope : ""), ignoreUrlParametersMatching = [/^utm_/], addDirectoryIndex = function (e, n) { var s = new URL(e); return "/" === s.pathname.slice(-1) && (s.pathname += n), s.toString() }, cleanResponse = function (e) { return e.redirected ? ("body" in e ? Promise.resolve(e.body) : e.blob()).then(function (n) { return new Response(n, { headers: e.headers, status: e.status, statusText: e.statusText }) }) : Promise.resolve(e) }, createCacheKey = function (e, n, s, c) { var a = new URL(e); return c && a.pathname.match(c) || (a.search += (a.search ? "&" : "") + encodeURIComponent(n) + "=" + encodeURIComponent(s)), a.toString() }, isPathWhitelisted = function (e, n) { if (0 === e.length) return !0; var s = new URL(n).pathname; return e.some(function (e) { return s.match(e) }) }, stripIgnoredUrlParameters = function (e, n) { var s = new URL(e); return s.hash = "", s.search = s.search.slice(1).split("&").map(function (e) { return e.split("=") }).filter(function (e) { return n.every(function (n) { return !n.test(e[0]) }) }).map(function (e) { return e.join("=") }).join("&"), s.toString() }, hashParamName = "_sw-precache", urlsToCacheKeys = new Map(precacheConfig.map(function (e) { var n = e[0], s = e[1], c = new URL(n, self.location), a = createCacheKey(c, hashParamName, s, !1); return [c.toString(), a] })); function setOfCachedUrls(e) { return e.keys().then(function (e) { return e.map(function (e) { return e.url }) }).then(function (e) { return new Set(e) }) } self.addEventListener("install", function (e) { e.waitUntil(caches.open(cacheName).then(function (e) { return setOfCachedUrls(e).then(function (n) { return Promise.all(Array.from(urlsToCacheKeys.values()).map(function (s) { if (!n.has(s)) { var c = new Request(s, { credentials: "same-origin" }); return fetch(c).then(function (n) { if (!n.ok) throw new Error("Request for " + s + " returned a response with status " + n.status); return cleanResponse(n).then(function (n) { return e.put(s, n) }) }) } })) }) }).then(function () { return self.skipWaiting() })) }), self.addEventListener("activate", function (e) { var n = new Set(urlsToCacheKeys.values()); e.waitUntil(caches.open(cacheName).then(function (e) { return e.keys().then(function (s) { return Promise.all(s.map(function (s) { if (!n.has(s.url)) return e.delete(s) })) }) }).then(function () { return self.clients.claim() })) }), self.addEventListener("fetch", function (e) { if ("GET" === e.request.method) { var n, s = stripIgnoredUrlParameters(e.request.url, ignoreUrlParametersMatching), c = "index.html"; (n = urlsToCacheKeys.has(s)) || (s = addDirectoryIndex(s, c), n = urlsToCacheKeys.has(s)); 0, n && e.respondWith(caches.open(cacheName).then(function (e) { return e.match(urlsToCacheKeys.get(s)).then(function (e) { if (e) return e; throw Error("The cached response that was expected is missing.") }) }).catch(function (n) { return console.warn('Couldn\'t serve response for "%s" from cache: %O', e.request.url, n), fetch(e.request) })) } });
