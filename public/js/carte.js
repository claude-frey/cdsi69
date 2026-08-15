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
//-------------------------------------------------
// INITIALISATION DE LA CARTE
//-------------------------------------------------
'use strict';

//-------------------------------------------------
// VARIABLES DE LA CARTE
//-------------------------------------------------

let carteInitialisee = false;
let fondPlanIGN = null;
let fondOSM = null;
//-------------------------------------------------
// ETAT DE LA CARTE
//-------------------------------------------------


function initialiserCarte() {

    if (carteInitialisee) return;

    carte = L.map('carte').setView([45.896,4.433],15); //passer de 15 à 16 ou 17 pour zoomer

    groupeWaypoints = L.layerGroup().addTo(carte);

   

// -------------------------------------------------
// FONDS DE CARTE
// -------------------------------------------------

fondPlanIGN = L.tileLayer(
    'https://data.geopf.fr/wmts?' +
    'SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0' +
    '&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2' +
    '&STYLE=normal' +
    '&FORMAT=image/png' +
    '&TILEMATRIXSET=PM' +
    '&TILEMATRIX={z}' +
    '&TILEROW={y}' +
    '&TILECOL={x}',
    {
        maxZoom: 19,
        attribution: '© IGN – Géoplateforme'
    }
);

fondOSM = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 22,
        attribution: '© OpenStreetMap'
    }
);

// Plan IGN affiché par défaut
fondPlanIGN.addTo(carte);


    carteInitialisee = true;

mettreAJourBatterie();
}
//-------------------------------------------------
// ACCES A LA CARTE
//-------------------------------------------------

function getCarte() {

    return carte;

}


//-------------------------------------------------
// GROUPE DES WAYPOINTS
//-------------------------------------------------

function getGroupeWaypoints() {

    return groupeWaypoints;

}


//-------------------------------------------------
// CENTRAGE SUR UNE COUCHE
//-------------------------------------------------

function centrerSurCouche(couche) {

    if (!carte) return;

    if (!couche) return;

    if (!couche.getBounds) return;

    carte.fitBounds(couche.getBounds());

}


//-------------------------------------------------
// RAFRAICHISSEMENT
//-------------------------------------------------

function rafraichirCarte() {

    if (!carte) return;

    setTimeout(function () {

        carte.invalidateSize();

    }, 100);

}
