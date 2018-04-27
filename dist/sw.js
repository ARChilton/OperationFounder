"use strict";var precacheConfig=[["/android-chrome-192x192.png","e62c0b35937d7f0957d14a23d29e0440"],["/android-chrome-512x512.png","013da30a12cf693e8644cad9240734e2"],["/cache-polyfill.js","cde61d2d6c29b8da5de5deed688195a4"],["/css/bootstrap.min.css","bae3a876fddfd1bd6a20e47e2dc41aa9"],["/css/images/layers-2x.png","4f0283c6ce28e888000e978e537a6a56"],["/css/images/layers.png","a6137456ed160d7606981aa57c559898"],["/css/images/marker-icon-2x.png","401d815dc206b8dc1b17cd0e37695975"],["/css/images/marker-icon.png","2273e3d8ad9264b7daa5bdbf8e6b47f8"],["/css/images/marker-shadow.png","44a526eed258222515aa21eaffd14a96"],["/css/leaflet.css","2e3ec870600bfe305999d8cddabefcde"],["/css/style.css","d83a81b752b367c208f90fe0537ddb19"],["/favicon-16x16.png","7198e03e2024ae4000b801cfc7f9d998"],["/favicon-32x32.png","5319f296bd4431a9f57eb232acafc806"],["/img/bgmap-img/ac-highlight-footpath.png","a9d61dcae83922b7927d02ccf94074a8"],["/img/bgmap-img/mb-dark.png","6ef149bf5e9021f61d7c4cc9a7b7ab6a"],["/img/bgmap-img/mb-sat-hybrid.png","08c7421598ba8e372923c2c5214dbbe4"],["/img/bgmap-img/mb-sat.png","7a1a9fa8f594735be64d58cf21090b18"],["/img/bgmap-img/mb-streets.png","ac15f97d3fb2e972d78c6c800dad4bdd"],["/img/bgmap-img/os.png","0e63e4ac8173c82e1a9a0d6fa6f2ab1e"],["/img/bingLogo/bing_maps_logo_gray.png","753575d6119112dcd3152f6b5b9f6ed0"],["/img/bingLogo/bing_maps_logo_white.png","544660a38c7604f85f23899c1145d6fd"],["/img/brand-your-event-landscape.png","9b4082300ed48b6034e99a98183453fe"],["/img/brand-your-event.png","6b48f027b9c357e9918c71a7b63722e4"],["/img/dropdown.svg","f7ff757e04d647692229d0856a6c5bc7"],["/img/flags.svg","ad9e422e1d6a17017647d782b25c552f"],["/img/hq-lock.png","7015b434035a0541c32df933b160615f"],["/img/hq-lock_white.png","09e90aa31605005acf5cce23fe57bfbf"],["/img/icon.svg","507547c6987070a58576b817e8d9235b"],["/img/largeLogo.svg","8df3cd7556bb52da44856a12abf9d8e3"],["/img/last-seen-admin-page-900.png","40337f5ade195e84e2b3f53674fcc179"],["/img/last-seen-admin-page.png","45bba9ad742c371f58407027770387b7"],["/img/leaderboard-admin-page-900.png","b85691cea40248eabd698cb5f11ab04f"],["/img/leaderboard-admin-page.png","c42615104162e6915036333c5ddb8488"],["/img/longLogo.svg","4f8866870f8268428fb078baa8881be4"],["/img/map-pin-fill.svg","584d1c676a7c56ed3d252d16dc8c8218"],["/img/map-pin.svg","4fd3aa25df7351b1312ca4b0003c0cf3"],["/img/marker-shadow.png","44a526eed258222515aa21eaffd14a96"],["/img/messages-checkpoint-live-900.png","564b633a2bbaa54d2d861e74c220f4a4"],["/img/messages-checkpoint-live.png","de9b0665e1fb70ee5d86b1ec8654158e"],["/img/operationFounder.png","f46bc942d899117c8c62109f3f5e8d55"],["/img/what-is-checkpoint-live-animated.svg","d6726d423a67c21f65be368839e8b5e0"],["/img/what-is-checkpoint-live.svg","28b41aa9e9e124baf00bd8121852f386"],["/index.html","192006ef0306a2e6553576ecc2a59250"],["/js/JQuery/jquery-3.1.1.min.js","9de47ce402f88e5fb35c945516e1b448"],["/js/leaflet-1.3.1/leaflet-src.js","9f2107451b77bd989c2bab582231e549"],["/js/leaflet-plugins/L.TileLayer.PouchDBCached.js","adbc9f15948213f3f10057c77d2ec898"],["/js/leaflet-plugins/iconLayers.js","92ef78345667cc1e740a23cbbfeae8f0"],["/js/leaflet-plugins/leaflet-bing-layer.js","24b1148ce11213bc13c1aace504e499e"],["/js/leaflet-plugins/leaflet.edgebuffer.js","49a866b5126b7b763536f2bfc765bff8"],["/js/leaflet-plugins/leaflet.markercluster-src.js","0b46008ed9427bb023144baac696f97e"],["/js/operationFounder.js","1e59d1bebc2b33fb42c8c70337a5cc9e"],["/js/pouchdb/pouchdb-6.3.4.min.js","b46ae20ef58cc38f3a5ef20f30d002c8"],["/js/pouchdb/pouchdb.find.min.js","0455fe1640dd1f3fb42bde33dc399002"],["/largeLogo-500x100.png","138038d7860d0ae38e2d210c6a82c613"],["/largeLogo.png","8688891ed84c94e19011c8c4aa70447f"],["/lib/onsenui/css/font-awesome.css","cf3894d3ce73ad0e0c52f32435d086fc"],["/lib/onsenui/css/font_awesome/fonts/FontAwesome.otf","5dc41d8fe329a22fa1ee9225571c843e"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.eot","25a32416abee198dd821b0b17a198a8f"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.ttf","1dc35d25e61d819a9c357074014867ab"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff","c8ddf1e5e5bf3682bc7bebf30f394148"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff2","e6cf7c6ec7c2d6f670ae9d762604cb0b"],["/lib/onsenui/css/ionicons.css","aaf730ce5fd6012094af4c460fe70419"],["/lib/onsenui/css/ionicons/fonts/ionicons.eot","19e65b89cee273a249fba4c09b951b74"],["/lib/onsenui/css/ionicons/fonts/ionicons.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/ionicons/fonts/ionicons.ttf","dd4781d1acc57ba4c4808d1b44301201"],["/lib/onsenui/css/ionicons/fonts/ionicons.woff","2c159d0d05473040b53ec79df8797d32"],["/lib/onsenui/css/material-design-iconic-font.css","8ab98ef794842cd328043aa07cb4aa41"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.eot","e833b2e2471274c238c0553f11031e6a"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.ttf","b351bd62abcd96e924d9f44a3da169a7"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff","d2a55d331bdd1a7ea97a8a1fbb3c569c"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff2","a4d31128b633bc0b1cc1f18a34fb3851"],["/lib/onsenui/css/onsen-css-components-blue-basic-theme.css","a062ed82c7a9804f0d969c55a4249ea6"],["/lib/onsenui/css/onsen-css-components.css","16f86346690130bb591aab3e68422b8f"],["/lib/onsenui/css/onsenui.css","55f628550205a3d639123a59062077c2"],["/lib/onsenui/js/onsenui.js","fc7814e24ad6e4cb4d0113840bcf07de"],["/lost/index.html","2b25ec4225675375107a79d14a3fdea9"],["/lost/lost.css","a796585f9f623695d915fec49e27c526"],["/lost/lost.js","a12de5b11bf2a3c7d3e32e22a25fd4d3"],["/mstile-150x150.png","ad2a2b5d1e7afc1528bf8e62f72385d9"],["/pricing/index.html","5688773246ecf3ad7c2cc9fd7cffce1b"],["/pricing/pricing.js","007515ecf3f210044e6dd3191f2acdc4"],["/qapple-touch-icon.png","016fda561bb45596911a3caf85cd81bb"],["/safari-pinned-tab.svg","e6d507ba7043dd05d10a6cef11b9ec20"],["/social-media-logos/alargeLogo500x390-google.png","747d5693e7ef14acb45c33654cbd81ed"],["/social-media-logos/icon 300x300.png","d433e28f021a76cb8fdcc640d26db320"],["/social-media-logos/largeLogo-1200x393.png","202dd81d53d2c44480d70ae9ef71aa8d"],["/social-media-logos/largeLogo-1200x600.png","cfb6c806a2d766fb6f3756273ec9cb95"],["/social-media-logos/largeLogo-1200x627.png","67ec28000440a95ea0333fc7cd147153"],["/social-media-logos/largeLogo-500x100.png","138038d7860d0ae38e2d210c6a82c613"],["/social-media-logos/largeLogo.png","220fb96e94ca018acc9584bf169880f8"],["/social-media-logos/largeLogo500x390-google.png","747d5693e7ef14acb45c33654cbd81ed"],["/terms/index.html","a69222aac20e3d565bd9af093a57830c"]],cacheName="sw-precache-v3--"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var n=new URL(e);return"/"===n.pathname.slice(-1)&&(n.pathname+=a),n.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,a,n,c){var s=new URL(e);return c&&s.pathname.match(c)||(s.search+=(s.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(n)),s.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var n=new URL(a).pathname;return e.some(function(e){return n.match(e)})},stripIgnoredUrlParameters=function(e,a){var n=new URL(e);return n.hash="",n.search=n.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return a.every(function(a){return!a.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),n.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],n=e[1],c=new URL(a,self.location),s=createCacheKey(c,hashParamName,n,!1);return[c.toString(),s]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(n){if(!a.has(n)){var c=new Request(n,{credentials:"same-origin"});return fetch(c).then(function(a){if(!a.ok)throw new Error("Request for "+n+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return e.put(n,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(n){return Promise.all(n.map(function(n){if(!a.has(n.url))return e.delete(n)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var a,n=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(a=urlsToCacheKeys.has(n))||(n=addDirectoryIndex(n,"index.html"),a=urlsToCacheKeys.has(n));0,a&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(n)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)}))}});