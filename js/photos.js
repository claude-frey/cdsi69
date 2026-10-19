/*    CDSI69
    Version : 2.15- octobre 2026
    Fichier : package.json

    Auteurs :
        Claude Frey
        &
        OpenAI ChatGPT

    
    Architecture :
        aide.html 
        index.html
        manifest.json
        package.json
        package-lock.json
        service-worker.js
        test-gps.html
        Version.txt
        vite.config.js
            |
            |__js
                +__app.js
                +__carte.js
                +__debug.js
                +__dictee.js
                +__export.js
                +__export_GPX.js
                +__gps.js
                +__gpx.js
                +__jszip.min.js
                +__leaflet.js
                +__leaflet-omnivore.js
                +__photos.js
                +__sauvegarde.js
                +__waypoints.js
                +__xlsx.bundle.js
                +__xlsx.full.min.js
            |__css
                +leaflet.css
                +__style.js
            |__dist
                |__assets
                |__images
                |__js
                +__index.html
            |__Documents
                +__CDSI69_Carnet_d_architecture_v1
            |__icones
                +__icon-50.png
                +__icon-125.png
                +__icon-192.png
                +__icon-512.png
            |__images
            |__node_modules
            |__public
                |__images
                |__js 
*/
// =====================================================
// CDSI69 - GESTION DES PHOTOS
// Stockage local IndexedDB
// =====================================================

const NOM_BDD_PHOTOS = "CDSI69_Photos";
const VERSION_BDD_PHOTOS = 1;
const NOM_MAGASIN_PHOTOS = "photos";

let bddPhotos = null;


// =====================================================
// OUVERTURE DE LA BASE DE DONNÉES
// =====================================================

function ouvrirBasePhotos() {

    return new Promise(function(resolve, reject) {
     const requete = indexedDB.open(
            NOM_BDD_PHOTOS,
            VERSION_BDD_PHOTOS
        );

        requete.onupgradeneeded = function(event) {

            const bdd = event.target.result;

            if (!bdd.objectStoreNames.contains(NOM_MAGASIN_PHOTOS)) {

                bdd.createObjectStore(
                    NOM_MAGASIN_PHOTOS,
                    { keyPath: "id" }
                );

            }

        };

        requete.onsuccess = function(event) {

            bddPhotos = event.target.result;

            resolve(bddPhotos);

        };

        requete.onerror = function() {

            reject(requete.error);

        };

    });

}

// =====================================================
// ENREGISTRER UNE PHOTO DANS INDEXEDDB
// =====================================================

function enregistrerPhotoDansBDD(photo) {

    return ouvrirBasePhotos().then(function(bdd) {

        return new Promise(function(resolve, reject) {

     const transaction =
                bdd.transaction(
                    [NOM_MAGASIN_PHOTOS],
                    "readwrite"
                );

            const magasin =
                transaction.objectStore(
                    NOM_MAGASIN_PHOTOS
                );


            const requete =
                magasin.put(photo);

          requete.onsuccess = function() {

    

    resolve();

};

            requete.onerror = function() {

                reject(requete.error);

            };

        });

    });

}


// =====================================================
// RÉCUPÉRER UNE PHOTO DEPUIS INDEXEDDB
// ===================================================== 
 function recupererPhotoDepuisBDD(id) {

    return ouvrirBasePhotos().then(function(bdd) {

        return new Promise(function(resolve, reject) {

            const transaction =
                bdd.transaction(
                    [NOM_MAGASIN_PHOTOS],
                    "readonly"
                );

            const magasin =
                transaction.objectStore(
                    NOM_MAGASIN_PHOTOS
                );



            const requete =
                magasin.get(id);

            requete.onsuccess = function() {

                resolve(requete.result);

            };

            requete.onerror = function() {

                reject(requete.error);

            };

        });

    });

}  

// SUPPRIMER UNE PHOTO DEPUIS INDEXEDDB
// =====================================================

function supprimerPhotoDepuisBDD(id) {

    return ouvrirBasePhotos().then(function(bdd) {

        return new Promise(function(resolve, reject) {

            const transaction =
                bdd.transaction(
                    [NOM_MAGASIN_PHOTOS],
                    "readwrite"
                );

            const magasin =
                transaction.objectStore(
                    NOM_MAGASIN_PHOTOS
                );

            const requete =
                magasin.delete(id);

            requete.onsuccess = function() {

                resolve();

            };

            requete.onerror = function() {

                reject(requete.error);

            };

        });

    });
}    