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

var precacheConfig = [["/android-chrome-192x192.png", "e62c0b35937d7f0957d14a23d29e0440"], ["/android-chrome-512x512.png", "013da30a12cf693e8644cad9240734e2"], ["/apple-touch-icon.png", "016fda561bb45596911a3caf85cd81bb"], ["/cache-polyfill.js", "0296d356fd280bf52caab3e2e366ad3f"], ["/components/loader.css", "2187be944edf356e2e52f940f366508e"], ["/components/loader.js", "7e345ec12e9779a5c5a85171121fdf1e"], ["/components/monaca-cordova-loader/cordova-loader.js", "a73e5c5dd1543a55385a271f1ef3d948"], ["/components/monaca-core-utils/monaca-core-utils.js", "994cdff2963cc66b908e959deb5d3abd"], ["/css/bootstrap.min.css", "247c6255e37f944946c73eaa79e06ceb"], ["/css/style.css", "ffb7eda45aeb83be9c6fa71f7b254038"], ["/favicon-16x16.png", "7198e03e2024ae4000b801cfc7f9d998"], ["/favicon-32x32.png", "5319f296bd4431a9f57eb232acafc806"], ["/img/bingLogo/bing_maps_logo_gray.png", "753575d6119112dcd3152f6b5b9f6ed0"], ["/img/bingLogo/bing_maps_logo_white.png", "544660a38c7604f85f23899c1145d6fd"], ["/img/hq-lock.png", "7015b434035a0541c32df933b160615f"], ["/img/hq-lock_white.png", "09e90aa31605005acf5cce23fe57bfbf"], ["/img/operationFounder-compass-logo.jpg", "0756a44dad9f273bf80b570e7270589e"], ["/img/operationFounder-compass-logo.png", "6bbc0447264b2e1648777e9188595f56"], ["/img/operationFounder.png", "f46bc942d899117c8c62109f3f5e8d55"], ["/img/operationFounderLogo.jpg", "3837b6a2ef49212f850eef57f37e3f7f"], ["/index.html", "908ff9dc16f261b9c00ac7b89f97c40a"], ["/js/JQuery/jquery-3.1.1.min.js", "5b5a269bd363e0886c17d855c2aab241"], ["/js/leaflet/L.TileLayer.PouchDBCached.js", "33233d616f9b2e4dfa6b8bbe8588571a"], ["/js/leaflet/images/layers-2x.png", "4f0283c6ce28e888000e978e537a6a56"], ["/js/leaflet/images/layers.png", "a6137456ed160d7606981aa57c559898"], ["/js/leaflet/images/marker-icon-2x.png", "d95d69fa8a7dfe391399e22c0c45e203"], ["/js/leaflet/images/marker-icon.png", "2273e3d8ad9264b7daa5bdbf8e6b47f8"], ["/js/leaflet/images/marker-shadow.png", "44a526eed258222515aa21eaffd14a96"], ["/js/leaflet/leaflet-bing-layer.js", "14013379029d16cb6790cffdaf0b985a"], ["/js/leaflet/leaflet-src.js", "b1aadf426928ef49375fb5a9b856c213"], ["/js/leaflet/leaflet.css", "f4dfd20f27bb4f93ff1d418c370c6de8"], ["/js/leaflet/leaflet.edgebuffer.js", "be6f70b7449b1d2ebf7d0ec1ec806e06"], ["/js/leaflet/leaflet.js", "c107e28b6b0a61c76a371b73e7067bbf"], ["/js/mdl/material.css", "24c82248f60f9dd78bd4c3fe8680cde4"], ["/js/mdl/material.js", "60f3ee61721d5bbac709fad9c239f2ac"], ["/js/mdl/material.min.css", "9ab85b48144d24908b4e455c2afb648c"], ["/js/mdl/material.min.js", "713af0c6ce93dbbce2f00bf0a98d0541"], ["/js/operationFounder.js", "7713ac338853ca76d891e0457d12d92a"], ["/js/pouchdb/pouchdb-6.1.1.min.js", "7976496854775d7f0335170180276881"], ["/js/pouchdb/pouchdb-6.1.2.min.js", "8f694cb54cbde94e91b47cf7c33b75c2"], ["/js/pouchdb/pouchdb-6.3.4.min.js", "f4bb7db2f2928441613fca4cd7b25b34"], ["/js/pouchdb/pouchdb.find.min.6.1.2.js", "72cb323295602203d2b268fa547abfff"], ["/js/pouchdb/pouchdb.find.min.js", "df11899e1063e3e02493e0d5aaf660f7"], ["/lib/onsenui/css/font_awesome/css/font-awesome.css", "3d72cebe2a8abe1a158e7e5d28693d9b"], ["/lib/onsenui/css/font_awesome/css/font-awesome.min.css", "2d0084923efe2083d77ee38515e352bf"], ["/lib/onsenui/css/ionicons/css/ionicons.css", "48f03a2915021bf9ba8e365f7bfc5c46"], ["/lib/onsenui/css/ionicons/css/ionicons.min.css", "5b4ea3b45778bbc1abb89422c58a7dc2"], ["/lib/onsenui/css/material-design-iconic-font/css/material-design-iconic-font.css", "755c1ddadde36d922fd482954c3154dd"], ["/lib/onsenui/css/material-design-iconic-font/css/material-design-iconic-font.min.css", "eb8257d1445af37af7b6cddaf56eee05"], ["/lib/onsenui/css/onsen-css-components-blue-basic-theme.css", "d9d5bd73dee1bd09647ead5e846b4b27"], ["/lib/onsenui/css/onsen-css-components-blue-theme.css", "413f0353f76808a2c8becee65ecbd1c6"], ["/lib/onsenui/css/onsen-css-components-dark-theme.css", "fa2e4f40582d708ea73d17cfb8d1cb8d"], ["/lib/onsenui/css/onsen-css-components-default.css", "d9d5bd73dee1bd09647ead5e846b4b27"], ["/lib/onsenui/css/onsen-css-components-purple-theme.css", "14767d134321c4bce61f47e7c778e817"], ["/lib/onsenui/css/onsen-css-components-sunshine-theme.css", "831e20929a52768d147991bb37db9e1a"], ["/lib/onsenui/css/onsen-css-components.css", "05e684cdd127856e40bb7231e71f3736"], ["/lib/onsenui/css/onsen-css-components.min.css", "b63e3a7fdb93934078062127413e4ec9"], ["/lib/onsenui/css/onsenui.css", "7e4437fdb517b0d6cd9fba47462fee19"], ["/lib/onsenui/js/angular-onsenui.js", "8f3f01486e10c85d9a335e2f115c4593"], ["/lib/onsenui/js/angular-onsenui.min.js", "e3f84ed202da1ff7ef24963789316473"], ["/lib/onsenui/js/onsenui.min.js", "99fbbe7a6091d0943a54654a86e3b204"], ["/mstile-150x150.png", "ad2a2b5d1e7afc1528bf8e62f72385d9"]];
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

  return bodyPromise.then(function (body) {
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
  return whitelist.some(function (whitelistedPathRegex) {
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
    .map(function (kv) {
      return kv.split('='); // Split each 'key=value' string into a [key, value] array
    })
    .filter(function (kv) {
      return ignoreUrlParametersMatching.every(function (ignoredRegex) {
        return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
      });
    })
    .map(function (kv) {
      return kv.join('='); // Join each [key, value] array into a 'key=value' string
    })
    .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

  return url.toString();
};


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function (item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function (requests) {
    return requests.map(function (request) {
      return request.url;
    });
  }).then(function (urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return setOfCachedUrls(cache).then(function (cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function (cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, { credentials: 'same-origin' });
              return fetch(request).then(function (response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function (responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function () {

      // Force the SW to transition from installing -> active state
      return self.skipWaiting();

    })
  );
});

self.addEventListener('activate', function (event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.keys().then(function (existingRequests) {
        return Promise.all(
          existingRequests.map(function (existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function () {

      return self.clients.claim();

    })
  );
});


self.addEventListener('fetch', function (event) {
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
        caches.open(cacheName).then(function (cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function (response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function (e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});
