// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-final-1';
var filesToCache = [
  '/',
  '/index.html',
  
  '/assets/css/bootstrap.min.css',
  '/assets/css/material-kit.css',
  '/assets/js/bootstrap-datetimepicker.js',
  '/assets/js/bootstrap-selectpicker.js',
  '/assets/js/bootstrap-tagsinput.js',
  '/assets/js/bootstrap.min.js',
  '/assets/js/jasny-bootstrap.min.js',
  '/assets/js/jquery.flexisel.js',
  '/assets/js/jquery.min.js',
  '/assets/js/material-kit.js',
  '/assets/js/material.min.js',
  '/assets/js/moment.min.js',
  '/assets/js/nouislider.min.js',
  '/assets/img/examples/ecommerce-tips2.jpg',
  '/assets/img/examples/gucci.jpg',
  '/assets/img/examples/dolce.jpg',
  '/assets/img/examples/tom-ford.jpg',
  '/assets/img/examples/suit-1.jpg',
  '/assets/img/examples/suit-2.jpg',
  '/assets/img/examples/suit-3.jpg',
  '/assets/img/examples/suit-4.jpg',
  '/assets/img/examples/suit-5.jpg',
  '/assets/img/examples/suit-6.jpg',
  '/assets/img/examples/chris9.jpg',
  '/assets/img/examples/color3.jpg',
  '/assets/img/examples/chris1.jpg',
  '/assets/img/dg3.jpg',
  '/assets/img/dg1.jpg',
  '/assets/img/examples/color1.jpg',
  '/assets/img/dg6.jpg',
  '/assets/img/dg10.jpg',
  '/assets/img/examples/color1.jpg',
  '/assets/img/dg9.jpg',
  'assets/img/examples/color1.jpg',
  '/assets/img/examples/ecommerce-header.jpg',
  '/assets/img/faces/card-profile6-square.jpg',
  '/assets/img/faces/christian.jpg',
  '/assets/img/faces/card-profile4-square.jpg',
  '/assets/img/faces/card-profile1-square.jpg',
  '/assets/img/faces/marc.jpg',
  '/assets/img/faces/kendall.jpg',
  '/assets/img/faces/card-profile5-square.jpg',
  '/assets/img/faces/card-profile2-square.jpg',
  '/scripts/app.js',
  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons',
  'https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css'


];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});


