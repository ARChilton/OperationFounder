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

var precacheConfig = [["/css/bootstrap.min.css","bae3a876fddfd1bd6a20e47e2dc41aa9"],["/css/style.css","f5a9eb9a290c68a8163a468d627da982"],["/img/bingLogo/bing_maps_logo_gray.png","753575d6119112dcd3152f6b5b9f6ed0"],["/img/bingLogo/bing_maps_logo_white.png","544660a38c7604f85f23899c1145d6fd"],["/img/brand-your-event-landscape.png","9b4082300ed48b6034e99a98183453fe"],["/img/brand-your-event.png","6b48f027b9c357e9918c71a7b63722e4"],["/img/dropdown.svg","f7ff757e04d647692229d0856a6c5bc7"],["/img/flags.svg","ad9e422e1d6a17017647d782b25c552f"],["/img/hq-lock.png","7015b434035a0541c32df933b160615f"],["/img/hq-lock_white.png","09e90aa31605005acf5cce23fe57bfbf"],["/img/icon.svg","507547c6987070a58576b817e8d9235b"],["/img/largeLogo.svg","8df3cd7556bb52da44856a12abf9d8e3"],["/img/last-seen-admin-page-900.png","40337f5ade195e84e2b3f53674fcc179"],["/img/last-seen-admin-page.png","45bba9ad742c371f58407027770387b7"],["/img/leaderboard-admin-page-900.png","b85691cea40248eabd698cb5f11ab04f"],["/img/leaderboard-admin-page.png","c42615104162e6915036333c5ddb8488"],["/img/longLogo.svg","4f8866870f8268428fb078baa8881be4"],["/img/operationFounder.png","f46bc942d899117c8c62109f3f5e8d55"],["/img/what-is-checkpoint-live.svg","28b41aa9e9e124baf00bd8121852f386"],["/js/JQuery/jquery-3.1.1.min.js","9de47ce402f88e5fb35c945516e1b448"],["/js/operationFounder.js","d839f3721812f1a6ada4d50f083c903a"],["/js/pouchdb/pouchdb-6.3.4.min.js","b46ae20ef58cc38f3a5ef20f30d002c8"],["/js/pouchdb/pouchdb.find.min.js","0455fe1640dd1f3fb42bde33dc399002"],["/lib/onsenui/CHANGELOG.md","8c443a7467405ea2be313d018750545b"],["/lib/onsenui/README.md","47bad2967a8b100109affcba0c039a56"],["/lib/onsenui/css/font-awesome.css","cf3894d3ce73ad0e0c52f32435d086fc"],["/lib/onsenui/css/font_awesome/fonts/FontAwesome.otf","5dc41d8fe329a22fa1ee9225571c843e"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.eot","25a32416abee198dd821b0b17a198a8f"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.ttf","1dc35d25e61d819a9c357074014867ab"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff","c8ddf1e5e5bf3682bc7bebf30f394148"],["/lib/onsenui/css/font_awesome/fonts/fontawesome-webfont.woff2","e6cf7c6ec7c2d6f670ae9d762604cb0b"],["/lib/onsenui/css/ionicons.css","aaf730ce5fd6012094af4c460fe70419"],["/lib/onsenui/css/ionicons/fonts/ionicons.eot","19e65b89cee273a249fba4c09b951b74"],["/lib/onsenui/css/ionicons/fonts/ionicons.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/ionicons/fonts/ionicons.ttf","dd4781d1acc57ba4c4808d1b44301201"],["/lib/onsenui/css/ionicons/fonts/ionicons.woff","2c159d0d05473040b53ec79df8797d32"],["/lib/onsenui/css/material-design-iconic-font.css","8ab98ef794842cd328043aa07cb4aa41"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.eot","e833b2e2471274c238c0553f11031e6a"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.svg","46661d6d65debc63884004fed6e37e5c"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.ttf","b351bd62abcd96e924d9f44a3da169a7"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff","d2a55d331bdd1a7ea97a8a1fbb3c569c"],["/lib/onsenui/css/material-design-iconic-font/fonts/Material-Design-Iconic-Font.woff2","a4d31128b633bc0b1cc1f18a34fb3851"],["/lib/onsenui/css/onsen-css-components-blue-basic-theme.css","a062ed82c7a9804f0d969c55a4249ea6"],["/lib/onsenui/css/onsen-css-components.css","16f86346690130bb591aab3e68422b8f"],["/lib/onsenui/css/onsenui.css","55f628550205a3d639123a59062077c2"],["/lib/onsenui/js/onsenui.js","fc7814e24ad6e4cb4d0113840bcf07de"],["/lost/index.html","0b4bd3885bd24b60981593dee2ae3e41"],["/lost/lost.css","a796585f9f623695d915fec49e27c526"],["/lost/lost.js","a12de5b11bf2a3c7d3e32e22a25fd4d3"],["/pricing/index.html","6b0a7702a1cc8523a13f015d3ff61cfe"],["/pricing/pricing.js","d09f9a7cbd8a57cf246e75539a359c6b"],["/social-media-logos/icon 300x300.png","d433e28f021a76cb8fdcc640d26db320"],["/social-media-logos/largeLogo-1200x393.png","202dd81d53d2c44480d70ae9ef71aa8d"],["/social-media-logos/largeLogo-1200x600.png","cfb6c806a2d766fb6f3756273ec9cb95"],["/social-media-logos/largeLogo-1200x627.png","67ec28000440a95ea0333fc7cd147153"],["/social-media-logos/largeLogo-500x100.png","138038d7860d0ae38e2d210c6a82c613"],["/social-media-logos/largeLogo.png","220fb96e94ca018acc9584bf169880f8"]];
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







