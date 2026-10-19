/*ChatGPT
    CDSI69
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
// ======================================================
// Sauvegarde automatique de la collecte
// ======================================================

let collecteModifiee = false;

// ======================================================
// Sauvegarde automatique toutes les 30 secondes
// ======================================================

let intervalleSauvegardeAutomatique = null;

function effectuerSauvegardeAutomatique() {

    if (collecteEnCoursPourEcran !== true) {
        return;
    }

    try {

        sauvegarderCollecte();

    } catch (erreur) {

        console.error(
            "CDSI69 : échec de la sauvegarde automatique.",
            erreur
        );

    }

}

function demarrerSauvegardeAutomatique() {

    // Éviter de créer plusieurs minuteries
    arreterSauvegardeAutomatique();

    // Première sauvegarde immédiate
    effectuerSauvegardeAutomatique();

    // Puis sauvegarde toutes les 30 secondes
    intervalleSauvegardeAutomatique = setInterval(
        effectuerSauvegardeAutomatique,
        30000
    );

}

function arreterSauvegardeAutomatique() {

    if (intervalleSauvegardeAutomatique !== null) {

        clearInterval(
            intervalleSauvegardeAutomatique
        );

        intervalleSauvegardeAutomatique = null;

    }

}

// Sauvegarde supplémentaire si l'application passe en arrière-plan
document.addEventListener("visibilitychange", function() {

    if (
        document.visibilityState === "hidden" &&
        collecteEnCoursPourEcran === true
    ) {

        effectuerSauvegardeAutomatique();

    }

});

function sauvegarderCollecte() {

   const collecte = {

    version: "2.13",

    dateSauvegarde: Date.now(),

    //nomCollecte,
    nomCollecte: document.getElementById("tdbCircuit").textContent,

    informationsCollecte: { ...informationsCollecte },

    numeroWP,

    distanceCollecte,

    traceParcourue,

    contenuGPX,

    waypoints: waypoints.map(wp => {

        const copie = { ...wp };

        delete copie.marqueur;

        return copie;

    })

};

    localStorage.setItem(
        "CDSI69_Collecte",
        JSON.stringify(collecte)
    );

   

    collecteModifiee = false;

  
}

function supprimerCollecteInterrompue() {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cette collecte interrompue ?\n\n" +
        "La trace GPS, les waypoints et toutes les informations enregistrées seront définitivement supprimés."
    );

    if (!confirmation) {
        return;
    }

    // Suppression de la collecte sauvegardée
    localStorage.removeItem("CDSI69_Collecte");

    // Mise à jour de la variable si elle existe
    if (typeof collecteInterrompue !== "undefined") {
        collecteInterrompue = null;
    }

    // Fermeture de la fenêtre
    fermerCollecteInterrompue();

    alert("La collecte interrompue a été supprimée.");
}

function nettoyerCollecteInterrompue() {

    localStorage.removeItem("CDSI69_Collecte");

    if (typeof collecteInterrompue !== "undefined") {
        collecteInterrompue = null;
    }

}

function collecteModifieeDepuisDerniereSauvegarde() {

    collecteModifiee = true;

}


function restaurerCollecte(collecte) {

    if (!collecte) {
      
        return;
    }


    nomCollecte = collecte.nomCollecte;

    if (
    collecte.informationsCollecte &&
    typeof collecte.informationsCollecte === "object"
) {
    Object.assign(
        informationsCollecte,
        collecte.informationsCollecte
    );

    const champVitesse = document.getElementById("vitesseMoyenne");

    if (
        champVitesse &&
        Number.isFinite(Number(informationsCollecte.vitesse)) &&
        Number(informationsCollecte.vitesse) > 0
    ) {
        champVitesse.value = Number(informationsCollecte.vitesse);
    }
}

    // ===== Restauration des variables =====

    if (collecte.numeroWP !== undefined) {
    numeroWP = collecte.numeroWP;
    } else {
    numeroWP = collecte.waypoints.length + 1;
}

    distanceCollecte = collecte.distanceCollecte;
    traceParcourue = collecte.traceParcourue;
    contenuGPX = collecte.contenuGPX;

    if (contenuGPX) {

    chargerTexteGPX(contenuGPX);

}

// ===== Restauration des waypoints =====

waypoints = collecte.waypoints || [];

    // ===== Mise à jour du tableau de bord =====

document.getElementById("tdbCircuit").textContent =
    nomCollecte || "-";

document.getElementById("nbWaypoints").textContent =
    waypoints.length;

document.getElementById("tdbPK").textContent =
    Math.round(distanceCollecte) + " m";

if (contenuGPX) {

    chargerTexteGPX(contenuGPX);

}

// ===== Restauration des waypoints =====

waypoints = collecte.waypoints || [];

groupeWaypoints.clearLayers();

waypoints.forEach(function (wp) {

    restaurerWaypoint(wp);

});

    let points = traceParcourue.map(p => [
    p.latitude,
    p.longitude
]);

if (traceMarcheur) {
    traceMarcheur.setLatLngs(points);

    // Facultatif mais pratique : centrer la carte sur la trace
   
   if (points.length > 1) {

    setTimeout(function () {

        carte.invalidateSize();

        carte.fitBounds(traceMarcheur.getBounds(), {
            padding: [20, 20],
            maxZoom: 17
        });

    }, 100);

}


}



//debugTel(
//    "Restauration",
//    "Trace : " + traceParcourue.length +
//    "\nWaypoints restaurés : " + waypoints.length
//);

}

function verifierCollecteInterrompue() {

    let texte = localStorage.getItem("CDSI69_Collecte");

    if (!texte) {

        

        return null;

    }

   

    return JSON.parse(texte);

}

function afficherCollecteInterrompue(collecte) {

    const date = new Date(collecte.dateSauvegarde);

    document.getElementById("resumeCollecte").innerHTML =
        "<p><b>Nom de la collecte :</b><br>" +
        (collecte.nomCollecte || "Collecte sans nom") +
        "</p>" +

        "<p><b>Dernière sauvegarde :</b><br>" +
        date.toLocaleString("fr-FR") +
        "</p>" +

        "<p><b>Dernier WP enregistré :</b><br>WP " +
        collecte.waypoints.length +
        "</p>";

    document.getElementById("fenetreCollecte")
        .classList.remove("cache");
}

function fermerCollecteInterrompue() {

    document
        .getElementById("fenetreCollecte")
        .classList.add("cache");

}

function reprendreCollecte() {

   

    // Fermer la popup
    fermerCollecteInterrompue();

    // Changer d'écran
    document.getElementById("cdsi_preparation").style.display = "none";
    document.getElementById("cdsi_collecte").style.display = "block";

    initialiserCarte();

    setTimeout(() => {
        carte.invalidateSize();
       
    }, 100);

    if (!traceMarcheur) {
        traceMarcheur = L.polyline([], {
            color: "red",
            weight: 4
        }).addTo(carte);

        console.log("traceMarcheur créée pour la reprise");
    }

    let collecte;

   if (
    collecteActive &&
    typeof collecteActive === "object"
) {

        collecte = collecteActive;

    } else {

        let texte = localStorage.getItem("CDSI69_Collecte");

        if (!texte) {
            alert("Aucune collecte sauvegardée.");
            return;
        }

        collecte = JSON.parse(texte);
    }

restaurerCollecte(collecte);

collecteActive = collecte;

collecteEnCoursPourEcran = true;

activerVerrouEcran();
demarrerSauvegardeAutomatique();

testerGPS();
}

function reprendreCollecteDepuisFichier() {

    fermerCollecteInterrompue();

    document.getElementById("cdsi_preparation").style.display = "none";
    document.getElementById("cdsi_collecte").style.display = "block";

    initialiserCarte();

    if (!traceMarcheur) {
        traceMarcheur = L.polyline([], {
            color: "red",
            weight: 4
        }).addTo(carte);
    }

restaurerCollecte(collecteActive);

collecteEnCoursPourEcran = true;
activerVerrouEcran();
demarrerSauvegardeAutomatique();

testerGPS();
}
   

function ouvrirCollecte() {

    document.getElementById("fichierCollecte").click();

}

//--------------------------------------------------

async function chargerCollecte(event) {

    const fichier = event.target.files[0];

    if (!fichier) return;

    // =============================================
    // Cas d'un fichier ZIP
    // =============================================

    if (fichier.name.toLowerCase().endsWith(".zip")) {

        try {

            const zip =
                await JSZip.loadAsync(fichier);

            let nomCDSI69 = null;

            Object.keys(zip.files).forEach(function(nom) {

                if (
                    nom.toLowerCase().endsWith(".cdsi69") &&
                    !zip.files[nom].dir
                ) {

                    nomCDSI69 = nom;

                }

            });

            if (!nomCDSI69) {

                alert(
                    "❌ Aucun fichier .cdsi69 trouvé dans ce ZIP."
                );
                        return;
            }

            const contenu =
                await zip.files[nomCDSI69]
                    .async("text");

            const collecte =
                JSON.parse(contenu);

            collecteActive = collecte;

           afficherRepriseCollecteArchivee(collecte);

            collecte.waypoints.forEach(
                restaurerWaypoint
            );

        } catch (erreur) {

            alert(
                "❌ Impossible d'ouvrir la collecte :\n\n" +
                erreur.message
            );

        }

        return;
    }
      // =============================================
    // Cas d'un ancien fichier .cdsi69
    // =============================================

    const lecteur = new FileReader();

    lecteur.onload = function(e) {

        try {

            const collecte =
                JSON.parse(e.target.result);

            collecteActive = collecte;

            afficherCollecteInterrompue(collecte);

            collecte.waypoints.forEach(
                restaurerWaypoint
            );

        } catch (erreur) {

            alert(
                "❌ Impossible de lire la collecte :\n\n" +
                erreur.message
            );

        }

    };

    lecteur.readAsText(fichier);
}

function afficherRepriseCollecteArchivee(collecte) {

    const date =
        collecte.dateSauvegarde
            ? new Date(collecte.dateSauvegarde)
            : null;

    document.getElementById("resumeRepriseArchivee").innerHTML =

        "<p><b>Nom de la collecte :</b><br>" +
        (collecte.nomCollecte || "Collecte sans nom") +
        "</p>" +

        "<p><b>Date de la collecte :</b><br>" +
        (date
            ? date.toLocaleString("fr-FR")
            : "Date inconnue") +
        "</p>" +

        "<p><b>Dernier WP enregistré :</b><br>WP " +
        (collecte.waypoints
            ? collecte.waypoints.length
            : 0) +
        "</p>";

    document.getElementById("fenetreRepriseArchivee")
        .classList.remove("cache");
}

function reprendreCollecteArchivee() {

    document.getElementById("fenetreRepriseArchivee")
        .classList.add("cache");

    reprendreCollecteDepuisFichier();

}


function annulerRepriseArchivee() {

    document.getElementById("fenetreRepriseArchivee")
        .classList.add("cache");

    collecteActive = null;

}