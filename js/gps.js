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



// ----- Variables GPS -----

let latitudeGPS = null;
let longitudeGPS = null;
let altitudeGPS = null;
let altitudePrecisionGPS = null;
let suiviGPS = null;
let marqueurGPS = null;
let traceMarcheur = null;
let traceParcourue = [];
let distanceTotale = 0;      // mètres réellement parcourus
let dernierPointGPS = null;  // dernier point retenu
let distanceCollecte = 0;
let dernierPointCollecte = null;



const DISTANCE_MINI = 3;      // seuil anti-jitter (mètres)


function mettreAJourPositionGPS(latitude, longitude) {
    

   if (marqueurGPS) {

    marqueurGPS.setLatLng([latitude, longitude]);

    if (!recentrageSuspendu) {

        carte.panTo([latitude, longitude]);

    }

    } 
    else {

        marqueurGPS = L.circleMarker(
            [latitude, longitude],
            {
                radius: 10,
                color: "white",
                weight: 3,
                fillColor: "red",
                fillOpacity: 1
            }
        ).addTo(carte);

  
    }
}

function mettreAJourTraceCollecte(latitude, longitude, altitude) {

    const pointActuel = L.latLng(latitude, longitude);

    if (dernierPointCollecte === null) {

        dernierPointCollecte = pointActuel;
        return;

    }

    const distance = dernierPointCollecte.distanceTo(pointActuel);

    if (distance >= DISTANCE_MINI) {

        distanceCollecte += distance;

        dernierPointCollecte = pointActuel;

        afficherDistanceCollecte();

    }


    

    if (!traceMarcheur) return;

   traceParcourue.push({
    latitude: latitude,
    longitude: longitude,
    altitude: altitude
});

    const points = traceParcourue.map(p => [
        p.latitude,
        p.longitude
    ]);

    traceMarcheur.setLatLngs(points);
}

function mettreAJourDistanceCollecte(latitude, longitude) {

    const pointActuel = L.latLng(latitude, longitude);

    // Premier point
    if (dernierPointCollecte === null) {
        dernierPointCollecte = pointActuel;
        afficherDistanceCollecte();
        return;
    }

    const distance = dernierPointCollecte.distanceTo(pointActuel);

    // Ignore les petits déplacements dus aux imprécisions GPS
    if (distance >= DISTANCE_MINI) {

        distanceCollecte += distance;
        dernierPointCollecte = pointActuel;

        afficherDistanceCollecte();
    }
}

function afficherDistanceCollecte() {

    const zone = document.getElementById("tdbPK");

    if (!zone) return;

    if (distanceCollecte < 1000) {

        zone.textContent = Math.round(distanceCollecte) + " m";

    } else {

        zone.textContent = (distanceCollecte / 1000).toFixed(2) + " km";

    }

}

function preparerCollecte() {

   

    if (groupeWaypoints) {
        
        groupeWaypoints.clearLayers();
   
    }

    // Supprimer l'ancienne trace rouge
    if (traceMarcheur) {
        carte.removeLayer(traceMarcheur);
        traceMarcheur = null;
    }

   // Création de la nouvelle trace rouge
    traceMarcheur = L.polyline([], {
        color: "red",
        weight: 4
    }).addTo(carte);

}


function testerGPS() {

   


// Évite un double démarrage du watchPosition
if (suiviGPS) {

    

    return;
}

    // Nouvelle trace de collecte



    // Démarrage du GPS
    


    suiviGPS = navigator.geolocation.watchPosition(

        function(position) {
                 
            latitudeGPS =
                position.coords.latitude;

            longitudeGPS =
                position.coords.longitude;

            altitudeGPS =
                position.coords.altitude;

            altitudePrecisionGPS =
                position.coords.altitudeAccuracy;    
          
            let precision =
                Math.round(
                    position.coords.accuracy
                );
            const tdbAltitude = document.getElementById("tdbAltitude");

if (altitudeGPS != null) {

    tdbAltitude.textContent =
        "⛰️ " + Math.round(altitudeGPS) + " m";

} else {

    tdbAltitude.textContent =
        "⛰️ ---";

}    

                // ----- Etat du GPS -----

const etatGPS = document.getElementById("etatGPS");

if (precision <= 15) {

    etatGPS.textContent =
        "🟢 GPS précision - de 15 m (" + precision + " m)";

} else if (precision <= 50) {

    etatGPS.textContent =
          "🟡 GPS précision 15 à 50 m (" + precision + " m)";


} else {

    etatGPS.textContent =
        "🔴 GPS précision + à 50 m (" + precision + " m)";

}

verifierDemarrage();



// ----- Ecart au GPX -----

const tdbEcart =
    document.getElementById("tdbEcart");

if (
    typeof pointsTrace !== "undefined" &&
    pointsTrace.length > 1
) {

    let resultat =
        segmentLePlusProcheGPX(
            L.latLng(
                latitudeGPS,
                longitudeGPS
            )
        );

    tdbEcart.textContent =
        Math.round(
            resultat.distance
        ) + " m";

} else {

    tdbEcart.textContent = "--";

}

mettreAJourPositionGPS(
    latitudeGPS,
    longitudeGPS
);

mettreAJourTraceCollecte(
    latitudeGPS,
    longitudeGPS,
    altitudeGPS
);

mettreAJourDistanceCollecte(
    latitudeGPS,
    longitudeGPS
);




        },

        function(erreur) {
    alert("Erreur GPS : " + erreur.code);


    
},

    {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 100000
    }

);
}

async function mettreAJourBatterie() {

    let tdbBatterie =
        document.getElementById("tdbBatterie");

    if (!tdbBatterie) {
        return;
    }

    if (!navigator.getBattery) {

        tdbBatterie.textContent = "🔋 --";
        return;

    }

    let batterie =
        await navigator.getBattery();

    function afficherBatterie() {

        let niveau =
            Math.round(batterie.level * 100);

        let icone;

        if (niveau >= 50)
            icone = "🟢🔋";
        else if (niveau >= 30)
            icone = "🟡🔋";
        else if (niveau >= 15)
            icone = "🟠🔋";
        else
            icone = "🔴🔋";

        tdbBatterie.textContent =
            icone + " " + niveau + " %";

    }
  afficherBatterie();

    batterie.addEventListener(
        "levelchange",
        afficherBatterie
    );

}    

function getTraceParcourue() {
    return traceParcourue;
}
function getDistanceCollecte() {
    return distanceCollecte;
}

function calculerDenivele(trace) {

    if (!trace || trace.length < 2) {

        return {
            denivelePositif: 0,
            deniveleNegatif: 0,
            altitudeMin: null,
            altitudeMax: null
        };

    }

    let denivelePositif = 0;
    let deniveleNegatif = 0;

    let altitudeMin = Infinity;
    let altitudeMax = -Infinity;

    let altitudePrecedente = null;

    for (let i = 0; i < trace.length; i++) {

        const altitude = trace[i].altitude;

        if (altitude == null) {
            continue;
        }

        // Altitudes extrêmes
        if (altitude < altitudeMin) {
            altitudeMin = altitude;
        }

        if (altitude > altitudeMax) {
                 altitudeMax = altitude;
        }

        // Première altitude exploitable
        if (altitudePrecedente === null) {
            altitudePrecedente = altitude;
            continue;
        }

        const difference =
            altitude - altitudePrecedente;

        // On ignore les variations inférieures à 2 m
        if (difference > 2) {

            denivelePositif += difference;

            altitudePrecedente = altitude;

        } else if (difference < -2) {

            deniveleNegatif -= difference;

            altitudePrecedente = altitude;
        }
    }

    return {
        denivelePositif:
            Math.round(denivelePositif),

        deniveleNegatif:
            Math.round(deniveleNegatif),
            
        altitudeMin:
            Math.round(altitudeMin),

        altitudeMax:
            Math.round(altitudeMax)
    };
}
