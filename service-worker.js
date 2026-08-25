// CDSI69 - Service Worker
// Version 1.0

const CACHE_NAME = "cdsi69-v2-3";

const FICHIERS_A_METTRE_EN_CACHE = [

    "/",
    "/index.html",
    "/aide.html",
    "/manifest.json",

    // CSS
    "/css/style.css",
    "/css/leaflet.css",

    // JavaScript CDSI69
    "/js/app.js",
    "/js/carte.js",
    "/js/debug.js",
    "/js/dictee.js",
    "/js/export_GPX.js",
    "/js/export.js",
    "/js/gps.js",
    "/js/gpx.js",
    "/js/jszip.min.js",
    "/js/leaflet.js",
    "/js/leaflet-omnivore.min.js",
    "/js/photos.js",
    "/js/sauvegarde.js",
    "/js/waypoints.js",
    "/js/xlsx.bundle.js",
    "/js/xlsx.full.min.js",

    // Icônes
    "/icones/icon-192.png",
    "/icones/icon-512.png"
    ];


// -------------------------------------------------
// INSTALLATION
// -------------------------------------------------

self.addEventListener("install", function(event) {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(function(cache) {

                return cache.addAll(
                    FICHIERS_A_METTRE_EN_CACHE
                );

            })

    );

});


// -------------------------------------------------
// ACTIVATION
// -------------------------------------------------

self.addEventListener("activate", function(event) {

    event.waitUntil(
         caches.keys().then(function(nomsCaches) {

            return Promise.all(

                nomsCaches.map(function(nomCache) {

                    if (nomCache !== CACHE_NAME) {

                        return caches.delete(nomCache);

                    }

                })

            );

        })

    );

    // Prend immédiatement le contrôle des pages
    self.clients.claim();

});


// -------------------------------------------------
// INTERCEPTION DES REQUÊTES
// -------------------------------------------------

self.addEventListener("fetch", function(event) {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        // On essaie d'abord le réseau
        fetch(event.request)

            .then(function(reponseReseau) {

                // Si la réponse est correcte,
                // on met à jour le cache
                if (reponseReseau && reponseReseau.ok) {

                    const copieReponse =
                        reponseReseau.clone();

                    caches.open(CACHE_NAME)
                        .then(function(cache) {

                            cache.put(
                                event.request,
                                copieReponse
                            );

                        });

                }

                return reponseReseau;
                           })

            .catch(function() {

                // Pas de réseau :
                // on utilise la version en cache
                return caches.match(event.request)

                    .then(function(reponseCache) {

                        if (reponseCache) {

                            return reponseCache;

                        }

                        // Pour la navigation hors connexion,
                        // retour à la page principale
                        if (
                            event.request.mode === "navigate"
                        ) {

                            return caches.match(
                                "/index.html"
                            );

                        }

                    });

            })

    );

});