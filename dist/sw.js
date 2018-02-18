/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["/android-chrome-192x192.png","e62c0b35937d7f0957d14a23d29e0440"],["/android-chrome-512x512.png","013da30a12cf693e8644cad9240734e2"],["/apple-touch-icon.png","016fda561bb45596911a3caf85cd81bb"],["/cache-polyfill.js","cde61d2d6c29b8da5de5deed688195a4"],["/components/loader.css","d41d8cd98f00b204e9800998ecf8427e"],["/components/loader.js","cc330819f1458fb529d6b19481fc0216"],["/components/monaca-cordova-loader/cordova-loader.js","7f2ff5bd2b52a064483bfb1cf3ae8e39"],["/components/monaca-core-utils/monaca-core-utils.js","0c127f3b8100b43f7727ab1358138758"],["/css/bootstrap.min.css","bae3a876fddfd1bd6a20e47e2dc41aa9"],["/css/style.css","5075540c24cfb5a768fa063ba1c7ef9a"],["/favicon-16x16.png","7198e03e2024ae4000b801cfc7f9d998"],["/favicon-32x32.png","5319f296bd4431a9f57eb232acafc806"],["/img/bingLogo/bing_maps_logo_gray.png","753575d6119112dcd3152f6b5b9f6ed0"],["/img/bingLogo/bing_maps_logo_white.png","544660a38c7604f85f23899c1145d6fd"],["/img/hq-lock.png","7015b434035a0541c32df933b160615f"],["/img/hq-lock_white.png","09e90aa31605005acf5cce23fe57bfbf"],["/img/largeLogo.svg","8df3cd7556bb52da44856a12abf9d8e3"],["/img/operationFounder.png","f46bc942d899117c8c62109f3f5e8d55"],["/index.html","10c8395a7d04147272bc4b8aace7a8ca"],["/js/JQuery/jquery-3.1.1.min.js","5d67849e00920cc6ceae64a01913a23b"],["/js/leaflet/L.TileLayer.PouchDBCached.js","a7a3191acb771161ef45eaee6d85dce4"],["/js/leaflet/images/layers-2x.png","4f0283c6ce28e888000e978e537a6a56"],["/js/leaflet/images/layers.png","a6137456ed160d7606981aa57c559898"],["/js/leaflet/images/marker-icon-2x.png","d95d69fa8a7dfe391399e22c0c45e203"],["/js/leaflet/images/marker-icon.png","2273e3d8ad9264b7daa5bdbf8e6b47f8"],["/js/leaflet/images/marker-shadow.png","44a526eed258222515aa21eaffd14a96"],["/js/leaflet/leaflet-bing-layer.js","cd2d50fe4e629ee2af4256e74e00a023"],["/js/leaflet/leaflet-src.js","7f412738e42fda4f6dffffbea7171874"],["/js/leaflet/leaflet.css","9f2ba63c1bd776f58a9818f4b102bac2"],["/js/leaflet/leaflet.edgebuffer.js","49a866b5126b7b763536f2bfc765bff8"],["/js/leaflet/leaflet.js","432d4044bcbbeb7033e45d48a7cb79a8"],["/js/mdl/material.css","a995745631c8caf2a7632ddbdb541dc8"],["/js/mdl/material.js","5079b2a409e3a72c5119f47daaed9faf"],["/js/mdl/material.min.css","401ae490a8793e7967aadc64f78b5d0e"],["/js/mdl/material.min.js","32757962854864d6fdea720938c2d2e7"],["/js/operationFounder.js","f8d6cd44d07680bd85049cdad7b7f0a9"],["/js/pouchdb/pouchdb-6.1.1.min.js","269a5f4bc4fb69e9a6cfa1ada41d9188"],["/js/pouchdb/pouchdb-6.1.2.min.js","c1838ff494395722f760a82eaf2f1a7b"],["/js/pouchdb/pouchdb-6.3.4.min.js","2704df9d3fe7ce6a9a18b1bdc7848dee"],["/js/pouchdb/pouchdb.find.min.6.1.2.js","fd86309221209c5048c604ff914fb90b"],["/js/pouchdb/pouchdb.find.min.js","00d132a6f1f8c0bad61193065298132c"],["/lib/onsenui/css/font_awesome/css/font-awesome.css","3d72cebe2a8abe1a158e7e5d28693d9b"],["/lib/onsenui/css/font_awesome/css/font-awesome.min.css","2d0084923efe2083d77ee38515e352bf"],["/lib/onsenui/css/font_awesome/fonts/FontAwesome.otf","5dc41d8fe329a22fa1ee9225571c843e"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.eot","25a32416abee198dd821b0b17a198a8f"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.svg","24c601e721ebd8279d38e2cfa0d01bc6"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.ttf","1dc35d25e61d819a9c357074014867ab"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff","c8ddf1e5e5bf3682bc7bebf30f394148"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff2","e6cf7c6ec7c2d6f670ae9d762604cb0b"],["/lib/onsenui/css/ionicons/css/ionicons.css","48f03a2915021bf9ba8e365f7bfc5c46"],["/lib/onsenui/css/ionicons/css/ionicons.min.css","5b4ea3b45778bbc1abb89422c58a7dc2"],["/lib/onsenui/css/ionicons/fonts/ionicons.eot","19e65b89cee273a249fba4c09b951b74"],["/lib/onsenui/css/ionicons/fonts/ionicons.svg","d6f01464e7788550147b8ddc6fd7e01c"],["/lib/onsenui/css/ionicons/fonts/ionicons.ttf","dd4781d1acc57ba4c4808d1b44301201"],["/lib/onsenui/css/ionicons/fonts/ionicons.woff","2c159d0d05473040b53ec79df8797d32"],["/lib/onsenui/css/material-design-iconic-font/css/material-design-iconic-font.css","755c1ddadde36d922fd482954c3154dd"],["/lib/onsenui/css/material-design-iconic-font/css/material-design-iconic-font.min.css","eb8257d1445af37af7b6cddaf56eee05"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.eot","e833b2e2471274c238c0553f11031e6a"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.svg","381f7754080ed2299a7c66a2504dff02"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.ttf","b351bd62abcd96e924d9f44a3da169a7"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff","d2a55d331bdd1a7ea97a8a1fbb3c569c"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff2","a4d31128b633bc0b1cc1f18a34fb3851"],["/lib/onsenui/css/onsen-css-components-blue-basic-theme.css","d9d5bd73dee1bd09647ead5e846b4b27"],["/lib/onsenui/css/onsen-css-components.css","05e684cdd127856e40bb7231e71f3736"],["/lib/onsenui/css/onsenui.css","4e84afc8ba69fd5abfe164a50a257f27"],["/lib/onsenui/js/onsenui.js","472b22dc2d05308633bbba03bbfbee3b"],["/mstile-150x150.png","ad2a2b5d1e7afc1528bf8e62f72385d9"],["/safari-pinned-tab.svg","e6d507ba7043dd05d10a6cef11b9ec20"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







