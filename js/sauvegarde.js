// ======================================================
// Sauvegarde automatique de la collecte
// ======================================================

let collecteModifiee = false;

function sauvegarderCollecte() {

   const collecte = {

    version: "2.13",

    dateSauvegarde: Date.now(),

    //nomCollecte,
    nomCollecte: document.getElementById("tdbCircuit").textContent,

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

    if (collecteActive) {

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

    testerGPS();
}
   

function ouvrirCollecte() {

    document.getElementById("fichierCollecte").click();

}

//--------------------------------------------------

function chargerCollecte(event) {
   
    const fichier = event.target.files[0];

    if (!fichier) return;

    const lecteur = new FileReader();

    lecteur.onload = function(e) {

        const collecte = JSON.parse(e.target.result);

        collecteActive = collecte;

        afficherCollecteInterrompue(collecte);
        collecte.waypoints.forEach(restaurerWaypoint);
    };

    lecteur.readAsText(fichier);

}
