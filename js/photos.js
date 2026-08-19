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

alert(
    "ENREGISTREMENT PHOTO\n\n" +
    "id = [" + photo.id + "]\n" +
    "idBDD = [" + photo.idBDD + "]\n" +
    "reference = [" + photo.reference + "]"
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

alert("ID photo demandé : [" + id + "]");

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