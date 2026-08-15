/*
    CDSI69
    Version : 2.11
    Fichier : package.json

    Auteurs :
        Claude Frey
        OpenAI ChatGPT

    Rôle :
        Interface principale de l'application.

    Architecture V2.11

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
                +__gps.js
                +__gpx.js
                +__waypoints.js
            |__css
                +__style.js
            |__Documents
                +__CDSI69_Carnet_d_architecture_v1
            |__icones
                +__icon-192.png
                +__icin-512.png
            |__images
            |__node_modules
*/
'use strict';



let contenuGPX = "";
let traceGPX = null;
let pointsTrace = [];
let nomBaseGPX = "";


function chargerGPX(event) {
 
    const fichier = event.target.files[0];

    if (!fichier) return;
    const nomGPX = fichier.name;

nomBaseGPX = nomGPX.replace(/\.gpx$/i, "");
const tdbCircuit = document.getElementById("tdbCircuit");


nomCollecte = nomBaseGPX;

if (tdbCircuit) {
    tdbCircuit.textContent = nomBaseGPX;
}
    waypoints = [];
    if (groupeWaypoints) {
    groupeWaypoints.clearLayers();
}
    waypointCourant = null;

indexWaypointCourant = -1;



const eltNom = document.getElementById("nomGPX");


const etat = document.getElementById("etatCircuit");


eltNom.style.display = "none";
etat.textContent = "🟢 Circuit chargé";


	numeroWP = 1;

    const lecteur = new FileReader();

    lecteur.onload = function(e) {

        contenuGPX = e.target.result;

chargerTexteGPX(
    contenuGPX
);
    };

    lecteur.readAsText(fichier);
etatCircuit.textContent = "🟢 Circuit sélectionné";
verifierDemarrage();
etatCircuit.textContent = "🟢 Circuit sélectionné";
}


function chargerTexteGPX(texteGPX) {
   
    initialiserCarte();

    const blob = new Blob(
        [texteGPX],
        { type: 'application/gpx+xml' }
    );

    const url = URL.createObjectURL(blob);

    if (traceGPX) {
        carte.removeLayer(traceGPX);
    }

    traceGPX = omnivore.gpx(url);
   

    traceGPX.on('ready', function() {
        


        

        pointsTrace =
            Object.values(traceGPX._layers)[0]._latlngs;
   

        let distanceTotale = 0;

        for (
            let i = 1;
            i < pointsTrace.length;
            i++
        ) {

            distanceTotale +=
                pointsTrace[i - 1].distanceTo(
                    pointsTrace[i]
                );

        }

        let distanceKm =
            (distanceTotale / 1000)
            .toFixed(1);

        /*
       document.getElementById(
       "distance"
        ).value = distanceKm;
*/
        let tempsHeures =
            distanceTotale / 1000 / 3.5;

        let heures =
            Math.floor(tempsHeures);

        let minutes =
            Math.round(
                (tempsHeures - heures) * 60
            );

        if (minutes === 60) {

            heures++;
            minutes = 0;

        }
/*
        document.getElementById(
            "tempsMarche"
        ).value =
  */
           heures + " h " +
            String(minutes)
            .padStart(2, "0");
            setTimeout(function () {
carte.invalidateSize();
        carte.fitBounds(
            traceGPX.getBounds());
}, 100);
      //  sauvegardeAutomatique();

    });


    traceGPX.addTo(carte);
    URL.revokeObjectURL(url);
   

}
