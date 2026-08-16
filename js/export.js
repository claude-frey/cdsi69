function construireObjetCollecte() {

    const collecte = {

    version: "2.12",

    nomCollecte: nomCollecte,
    numeroWP: numeroWP,
    distanceCollecte: distanceCollecte,
    contenuGPX: contenuGPX,

    mode: modeGPX.checked ? "GPX" : "LIBRE",

        dateSauvegarde: new Date().toISOString(),

        nombreWaypoints: waypoints.length,

        nombrePointsReference: pointsTrace.length,

        gpxReference: [...pointsTrace],

        nombrePointsParcourus: getTraceParcourue().length,

        traceParcourue: [...getTraceParcourue()],

        waypoints: waypoints.map(function (wp) {

                 return {

                numero: wp.numero,
                supprime: wp.supprime || false,
                latitude: wp.latitude,
                longitude: wp.longitude,
                ecartGPX: wp.ecartGPX,
                balisage: wp.balisage,
                balisageAutre: wp.balisageAutre,
                agglo: wp.agglo,
                cheminement: wp.cheminement,
                signaletique: wp.signaletique,
                signaletiqueAutre: wp.signaletiqueAutre,
                pk: wp.pk,
                entrePas: wp.entrePas,
                securite: wp.securite,
                securiteAutre: wp.securiteAutre,
                nuisances: wp.nuisances,
                autreNuisance: wp.autreNuisance,
                obsNuisance: wp.obsNuisance,
                poiPov: wp.poiPov,
                pasAPas: wp.pasAPas,
                photos: wp.photos.map(function(photo) {
                return {
                    id: photo.id,
                    reference: photo.reference,
                    nom: photo.nom,
                    type: photo.type,
                    taille: photo.taille,
                    date: photo.date,
                    commentaire: photo.commentaire

                    };

                })

            };

        }),

        informationsCollecte: informationsCollecte

    };

    return collecte;

}


function telechargerCollecte(collecte) {


    const contenu = JSON.stringify(collecte, null, 2);

    const blob = new Blob([contenu], {
    type: "application/json"
});

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;



    lien.download = collecte.nomCollecte + ".txt";

    document.body.appendChild(lien);

    lien.click();

setTimeout(function () {
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
}, 1000);

}

function exporterPhotos(collecte) {

    const zip = new JSZip();

    let nombrePhotos = 0;

    const promesses = [];

    // =============================================
    // Parcours des WP de la collecte originale
    // =============================================

    for (let i = 0; i < waypoints.length; i++) {

        const wp = waypoints[i];

        if (!wp.photos || wp.photos.length === 0) {
            continue;
        }

        // =============================================
        // Parcours des photos du WP
        // =============================================

        for (let j = 0; j < wp.photos.length; j++) {

            const photo = wp.photos[j];

            nombrePhotos++;

            // -----------------------------------------
            // Nom du fichier exporté
            // -----------------------------------------
             const extension =
                photo.nom.substring(
                    photo.nom.lastIndexOf(".")
                );

            const nomFichier =
                photo.reference + extension;

            const descriptif =
                photo.commentaire &&
                photo.commentaire.trim() !== ""
                    ? photo.commentaire
                    : "Photo sans descriptif";

            // -----------------------------------------
            // Photo encore disponible directement
            // -----------------------------------------

            if (photo.fichier instanceof Blob) {

                zip.file(
                    nomFichier,
                    photo.fichier
                );

                zip.file(
                    photo.reference + ".txt",
                    descriptif
                );

                continue;
            }

            // -----------------------------------------
            // Photo à récupérer depuis IndexedDB
            // -----------------------------------------
            
            const promesse =
                recupererPhotoDepuisBDD(photo.idBDD)

                .then(function(photoBDD) {

                    if (!photoBDD || !photoBDD.fichier) {

                        throw new Error(
                            "Photo introuvable : " +
                            photo.reference
                        );

                    }

                    zip.file(
                        nomFichier,
                        photoBDD.fichier
                    );

                    zip.file(
                        photo.reference + ".txt",
                        descriptif
                    );

                });

            promesses.push(promesse);
        }
    }

    // =============================================
    // Aucune photo
    // =============================================

    if (nombrePhotos === 0) {
          alert(
            "ℹ️ Aucune photo à exporter."
        );

        return;
    }

    // =============================================
    // Création du ZIP
    // =============================================

    Promise.all(promesses)

        .then(function() {

            return zip.generateAsync({
                type: "blob"
            });

        })

        .then(function(contenuZip) {

            const url =
                URL.createObjectURL(contenuZip);

            const lien =
                document.createElement("a");

            lien.href = url;

            lien.download =
                collecte.nomCollecte +
                "_Photos.zip";
                 
            document.body.appendChild(lien);

            lien.click();

            document.body.removeChild(lien);

            URL.revokeObjectURL(url);

            console.log(
                "CDSI69 : " +
                nombrePhotos +
                " photo(s) exportée(s)."
            );

        })

        .catch(function(erreur) {

            alert(
                "❌ Erreur export photos : " +
                erreur.message
            );

        });

}
