function construireObjetCollecte() {
//16 08 2026
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
                    idBDD: photo.idBDD,
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


function telechargerCollecte(collecte, pourZIP = false) {

    const contenu = JSON.stringify(collecte, null, 2);

    const blob = new Blob([contenu], {
        type: "application/octet-stream"
    });

    if (pourZIP) {

        return blob;

    }

    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;

    lien.download = collecte.nomCollecte + ".cdsi69";

    document.body.appendChild(lien);

    lien.click();

    document.body.removeChild(lien);

    URL.revokeObjectURL(url);

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
// ======================================================
// Export complet de la collecte dans un ZIP unique
// ======================================================

async function exporterCollecteZIP(collecte) {

    const fenetreZIP = null;

    try {

        // =============================================
        // Création du ZIP principal
        // =============================================

        const zip = new JSZip();

        // =============================================
        // Les 3 fichiers principaux
        // =============================================

        const fichierCDSI69 =
            telechargerCollecte(collecte, true);

        const fichierExcel =
            exporterExcel(collecte, true);

        const fichierGPX =
            exporterGPX(collecte, true);

        zip.file(
            collecte.nomCollecte + ".cdsi69",
            fichierCDSI69
        );

        zip.file(
            collecte.nomCollecte + ".xlsx",
            fichierExcel
        );

        zip.file(
              collecte.nomCollecte + "_enrichi.gpx",
            fichierGPX
        );

        // =============================================
        // Dossier Photos
        // =============================================

        const dossierPhotos =
            zip.folder("Photos");

        let nombrePhotos = 0;

        const promesses = [];

        // =============================================
        // Parcours des waypoints
        // =============================================

        for (let i = 0; i < waypoints.length; i++) {

            const wp = waypoints[i];

            if (!wp.photos || wp.photos.length === 0) {
                continue;
            }

            // =========================================
            // Parcours des photos du WP
            // =========================================

            for (let j = 0; j < wp.photos.length; j++) {

                const photo = wp.photos[j];

                nombrePhotos++;
                // -------------------------------------
                // Extension de la photo
                // -------------------------------------

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

                // -------------------------------------
                // Photo encore disponible
                // -------------------------------------

                if (photo.fichier instanceof Blob) {

                    dossierPhotos.file(
                        nomFichier,
                        photo.fichier
                    );

                    dossierPhotos.file(
                        photo.reference + ".txt",
                        descriptif
                    );

                    continue;
                }
                  // -------------------------------------
                // Photo à récupérer dans IndexedDB
                // -------------------------------------

                const promesse =
                    recupererPhotoDepuisBDD(photo.idBDD)

                    .then(function(photoBDD) {

                        if (
                            !photoBDD ||
                            !photoBDD.fichier
                        ) {

                            throw new Error(
                                "Photo introuvable : " +
                                photo.reference
                            );

                        }

                        dossierPhotos.file(
                            nomFichier,
                            photoBDD.fichier
                        );

                        dossierPhotos.file(
                            photo.reference + ".txt",
                            descriptif
                        );

                    });

                promesses.push(promesse);
            }
             }

        // =============================================
        // Attendre que toutes les photos soient prêtes
        // =============================================

        await Promise.all(promesses);

        // =============================================
        // Création du ZIP
        // =============================================

 const contenuZip =
    await zip.generateAsync({
        type: "blob"
    });

const contenuZipFinal = new Blob(
    [contenuZip],
    {
        type: "application/octet-stream"
    }
);
alert(
    "ZIP FINAL\n\n" +
    "Taille : " +
    contenuZipFinal.size +
    " octets\n\n" +
    "Type : " +
    contenuZipFinal.type
);

alert(
    "ZIP créé en mémoire.\n\n" +
    "Taille : " +
    Math.round(contenuZip.size / 1024) +
    " Ko"
);

// =============================================
// Téléchargement du ZIP unique
// =============================================

const url =
    URL.createObjectURL(contenuZipFinal);

const lien =
    document.createElement("a");

lien.href = url;

lien.download =
    collecte.nomCollecte + ".zip";

lien.style.display = "none";

document.body.appendChild(lien);

lien.click();

document.body.removeChild(lien);

setTimeout(function() {

    URL.revokeObjectURL(url);

}, 1000);


        console.log(
            "CDSI69 : ZIP complet créé."
        );

        console.log(
            "CDSI69 : " +
            nombrePhotos +
            " photo(s) ajoutée(s)."
        );

        return true;

    } catch (erreur) {

        console.error(
            "CDSI69 : erreur export ZIP :",
            erreur
        );

        alert(
            "❌ Erreur lors de la création du ZIP :\n\n" +
            erreur.message
        );

        return false;

    }

}