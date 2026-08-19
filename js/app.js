/*ChatGPT
    CDSI69
    Version : 2.11
    Fichier : package.json
ajInterface
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

alert("06h12");

window.onerror = function(message, source, lineno, colno, erreur) {

    
};

const VERSION_CDSI = "V2.13.0-dev01 30 07 11h32";

//document.getElementById("versionCDSI").textContent =
//    "CDSI69 " + VERSION_CDSI;


    let carte = null;

const modeGPX=document.getElementById('modeGPX');
const modeSansGPX=document.getElementById('modeSansGPX');
const zoneGPX=document.getElementById('zoneGPX');
const zoneTrace=document.getElementById('zoneTrace');
const etatMode=document.getElementById('etatMode');
const etatCircuit=document.getElementById('etatCircuit');
const etatGPS = document.getElementById("etatGPS");
const nomTrace=document.getElementById('nomTrace');
const btnCommencer=document.getElementById('btnCommencer');
let nomCollecte = "";
const informationsCollecte = {

    commune: "",
    lieu: "",
    acces: "",
    collecteurs: "",
    vitesse: 3.5

};
let collecteActive = null;
const COLONNES_EXCEL = [
    "WP",
    "Balisage",
    "Agglo",
    "Cheminement",
    "Signalétique",
    "Sécurité",
    "Nuisances",
    "Observations",
    "POI",
    "Pas à pas",
    "PK",
    "Entre deux",
    "Photos"
];
let photoEnCours = null;
let referencePhotoEnCours = "";

modeGPX.addEventListener('change',majInterface);
modeSansGPX.addEventListener('change',majInterface);
if (nomTrace) {
    nomTrace.addEventListener('input', majInterface);
}
// Mise en état initial de l'interface
majInterface();

// Création de la carte
initialiserCarte();

// Démarrage de la surveillance GPS

testerGPS();


function majInterface(){
  console.log(
    "majInterface - GPX =",
    modeGPX.checked,
    "Trace =",
    modeSansGPX.checked
);
const blocEcart = document.getElementById("blocEcart");
  if(modeGPX.checked){
    blocEcart.style.display = "";
zoneTrace.style.display = 'none';
 zoneGPX.innerHTML = `
  <p><strong>Circuit de référence</strong></p>

  <input
      type="file"
      id="gpxFile"
      accept=".gpx">

  <p id="nomGPX">Aucun circuit sélectionné</p>
`;

    document
      .getElementById("gpxFile")
      .addEventListener(
          "change",
          chargerGPX
      );

    zoneGPX.style.display='block';
    zoneTrace.style.display='none';

    etatMode.textContent='🟢 Mode : Le circuit est choisi';
    etatCircuit.textContent='🔴 Aucun circuit sélectionné';
  }
  if(modeSansGPX.checked){
    blocEcart.style.display = "none";
    zoneGPX.style.display='none';
    zoneTrace.style.display='block';
    etatMode.textContent='🟢 Mode : Nouvelle trace';
    etatCircuit.textContent=nomTrace.value.trim()
      ? '🟢 Trace nommée'
      : '🔴 Nom de trace manquant';
  }
  verifierDemarrage();
}

function verifierDemarrage() {

    let ok = false;

    if (MODE_DEBUG) {

        btnCommencer.disabled = false;

        return;
    }

    const gpsOK =
        latitudeGPS !== null &&
        longitudeGPS !== null;

    if (
        modeGPX.checked &&
        gpsOK
    ) {

        ok = true;
    }

    if (
        modeSansGPX.checked &&
        gpsOK
    ) {

        ok = true;
    }

    btnCommencer.disabled = !ok;
}


// -------- Migration V2.03a --------
const prep=document.getElementById('cdsi_preparation');
const collecte=document.getElementById('cdsi_collecte');
const btn=document.getElementById('btnCommencer');


btn.addEventListener(
    "click",
    function () {

      

        ouvrirFenetreInitialisation();

    }
);
document
    .getElementById("btnWaypoint")
    .addEventListener(
        "click",
        nouveauPointDeReleve
    );

document
    .getElementById("btnSupprimerPhotoVisionneuse")
    .addEventListener(
        "click",
        supprimerPhotoCourante
    );

    document.getElementById("btnTerminerCollecte")
        .addEventListener("click", terminerCollecte);

document.getElementById("btnArchiverCollecte")
        .addEventListener("click", archiverCollecte);

        document
    .getElementById("btnEnregistrerCommentairePhoto")
    .addEventListener(
        "click",
        enregistrerCommentairePhoto
    );

   
    // ===== Nouveau =====

document
    .getElementById("btnRetourCollecte")
    .addEventListener(
        "click",
        function () {

          
            collecte.style.display = "none";
            prep.style.display = "block";

            majInterface();

        }
    );

// ===================


document
    .getElementById("btnDemarrerCollecte")
    .addEventListener(
        "click",
        validerInitialisation
    );

function validerInitialisation() {

    nomCollecte = document
        .getElementById("nomCollecteInitial")
        .value
        .trim();

if (nomCollecte === "") {

    alert("Veuillez saisir un nom de collecte.");

    return;

}

informationsCollecte.commune =
    document
        .getElementById("communeDepart")
        .value
        .trim();

informationsCollecte.lieu =
    document
        .getElementById("lieuDepart")
        .value
        .trim();

informationsCollecte.acces =
    document
        .getElementById("accesDepart")
        .value
        .trim();

informationsCollecte.collecteurs =
    document
        .getElementById("collecteurs")
        .value
        .trim();

if (informationsCollecte.collecteurs === "") {

    alert("Veuillez saisir le nom du ou des collecteurs.");

    return;

}

informationsCollecte.vitesse =
    Number(
        document
            .getElementById("vitesseMoyenne")
            .value
    );

if (informationsCollecte.vitesse <= 0) {

    alert("La vitesse moyenne doit être supérieure à 0 km/h.");

    return;

}

    fermerFenetreInitialisation();

    demarrerCollecte();

}


function demarrerCollecte() {


   collecteActive = true;
    


    // Changement d'écran
    prep.style.display = "none";
    collecte.style.display = "block";

const blocEcart = document.getElementById("blocEcart");

if (modeSansGPX.checked) {

    blocEcart.style.display = "none";

    nouvelleCollecte();
    reinitialiserGPX();
    initialiserCarte();

    

} else {

    blocEcart.style.display = "";

}
    // Si on crée une nouvelle trace, il faut créer la carte


if (modeSansGPX.checked) {

    // On mémorise le nom AVANT de vider l'interface
    nomCollecte = document.getElementById("nomTrace").value.trim();

    nouvelleCollecte();
    initialiserCarte();
}

// Préparation d'une nouvelle collecte
preparerCollecte();

const tdbCircuit = document.getElementById("tdbCircuit");

if (tdbCircuit) {
    tdbCircuit.textContent = nomCollecte;
}

// Préparation d'une nouvelle collecte
preparerCollecte();

    // Redessin de la carte
    setTimeout(function () {

        if (carte) {

            carte.invalidateSize();

            if (traceGPX) {

                carte.fitBounds(traceGPX.getBounds());

            }

        }

    }, 200);

}

// ======================================================
// OUTILS D'INTERFACE UTILISATEUR
// ======================================================
function choisirBalisage(valeur) {

    // Mémorise le balisage
    document.getElementById("balisage").value = valeur;

    // Tous les boutons redeviennent gris
    document.getElementById("btnGR").classList.remove("selectionne");
    document.getElementById("btnGRP").classList.remove("selectionne");
    document.getElementById("btnPR").classList.remove("selectionne");
    document.getElementById("btnAucun").classList.remove("selectionne");
    document.getElementById("btnAutre").classList.remove("selectionne");

    // Le bouton choisi devient vert
    if (valeur == "GR")
        document.getElementById("btnGR").classList.add("selectionne");

    if (valeur == "GRP")
        document.getElementById("btnGRP").classList.add("selectionne");

    if (valeur == "PR")
        document.getElementById("btnPR").classList.add("selectionne");

    if (valeur == "Aucun")
        document.getElementById("btnAucun").classList.add("selectionne");
    if (valeur == "Autre")
    document.getElementById("btnAutre").classList.add("selectionne");

// Affiche ou masque la zone "Autre"

if (valeur == "Autre") {

    document.getElementById("zoneAutreBalisage").style.display = "block";
    document.getElementById("balisageAutre").focus();
}
else {

    document.getElementById("zoneAutreBalisage").style.display = "none";
    document.getElementById("balisageAutre").value = "";
}
}

function choisirSignaletique(valeur) {

    // Mémorise la signalétique
    document.getElementById("signaletique").value = valeur;

    // Tous les boutons redeviennent gris
    document.getElementById("btnSigAucun").classList.remove("selectionne");
    document.getElementById("btnDIR").classList.remove("selectionne");
    document.getElementById("btnFLE").classList.remove("selectionne");
    document.getElementById("btnDEP").classList.remove("selectionne");
    document.getElementById("btnINFO").classList.remove("selectionne");
    document.getElementById("btnSECU").classList.remove("selectionne");
    document.getElementById("btnSigAutre").classList.remove("selectionne");

    // Le bouton choisi devient vert
    if (valeur == "AUCUN")
        document.getElementById("btnSigAucun").classList.add("selectionne");

    if (valeur == "DIR")
        document.getElementById("btnDIR").classList.add("selectionne");

    if (valeur == "FLE")
        document.getElementById("btnFLE").classList.add("selectionne");

    if (valeur == "DEP")
        document.getElementById("btnDEP").classList.add("selectionne");

    if (valeur == "INFO")
        document.getElementById("btnINFO").classList.add("selectionne");

    if (valeur == "SECU")
        document.getElementById("btnSECU").classList.add("selectionne");

    if (valeur == "AUTRE")
        document.getElementById("btnSigAutre").classList.add("selectionne");

    // Affiche ou masque la zone "Autre"

    if (valeur == "AUTRE") {

        document.getElementById("zoneAutreSignaletique").style.display = "block";
        document.getElementById("signaletiqueAutre").focus();
    }
    else {

        document.getElementById("zoneAutreSignaletique").style.display = "none";
        document.getElementById("signaletiqueAutre").value = "";
    }
}

function choisirSecurite(valeur) {

    // Mémorise le choix
    document.getElementById("securite").value = valeur;

    // Tous les boutons redeviennent gris
    document.getElementById("btnTraversee").classList.remove("selectionne");
    document.getElementById("btnCirculation").classList.remove("selectionne");
    document.getElementById("btnVisibilite").classList.remove("selectionne");
    document.getElementById("btnGlissant").classList.remove("selectionne");
    document.getElementById("btnSecAutre").classList.remove("selectionne");

    // Le bouton choisi devient vert
    if (valeur == "TRAVERSEE")
        document.getElementById("btnTraversee").classList.add("selectionne");

    if (valeur == "CIRCULATION")
        document.getElementById("btnCirculation").classList.add("selectionne");

    if (valeur == "VISIBILITE")
        document.getElementById("btnVisibilite").classList.add("selectionne");

    if (valeur == "GLISSANT")
        document.getElementById("btnGlissant").classList.add("selectionne");

    if (valeur == "AUTRE")
        document.getElementById("btnSecAutre").classList.add("selectionne");

    // Affiche ou masque la zone "Autre"

    if (valeur == "AUTRE") {

        document.getElementById("zoneAutreSecurite").style.display = "block";
        document.getElementById("securiteAutre").focus();
    }
    else {

        document.getElementById("zoneAutreSecurite").style.display = "none";
        document.getElementById("securiteAutre").value = "";
    }
}

function gererNuisance() {

    const valeur =
        document.getElementById("nuisances").value;

    if (valeur === "AUTRE") {

        document.getElementById("zoneAutreNuisance").style.display = "block";
        document.getElementById("autreNuisance").focus();

    } else {

        document.getElementById("zoneAutreNuisance").style.display = "none";
        document.getElementById("autreNuisance").value = "";
    }
}




let collecteInterrompue = verifierCollecteInterrompue();

if (collecteInterrompue) {

    afficherCollecteInterrompue(collecteInterrompue);

}
document
    .getElementById("btnFermerCollecte")
    .addEventListener(
        "click",
        fermerCollecteInterrompue
    );

document
    .getElementById("btnContinuerCollecte")
    .addEventListener("click", continuerCollecte);

  document
    .getElementById("btnSupprimerCollecte")
    .addEventListener(
        "click",
        supprimerCollecteInterrompue
    );  

document
    .getElementById("btnAnnulerInitialisation")
    .addEventListener(
        "click",
        fermerFenetreInitialisation
    );


function choisirAgglo(valeur) {

    document.getElementById("agglo").value = valeur;

    document.getElementById("btnHorsAgglo")
        .classList.remove("selectionne");
    document.getElementById("btnEnAgglo")
        .classList.remove("selectionne");

    if (valeur == "H")
        document.getElementById("btnHorsAgglo")
            .classList.add("selectionne");
    else
        document.getElementById("btnEnAgglo")
            .classList.add("selectionne");
}


function choisirCheminement(valeur) {

    document.getElementById("cheminement").value = valeur;

    document.getElementById("btnRevetu")
        .classList.remove("selectionne");
    document.getElementById("btnNonRevetu")
        .classList.remove("selectionne");

    if (valeur == "R")
        document.getElementById("btnRevetu")
            .classList.add("selectionne");
    else
        document.getElementById("btnNonRevetu")
            .classList.add("selectionne");
}



//==================================================
// Nouvelle collecte
//==================================================

function nouvelleCollecte() {

    reinitialiserVariables();
    reinitialiserTrace();
    reinitialiserWaypoints();
    reinitialiserGPX();
    reinitialiserInterface();

}

//--------------------------------------------------

function reinitialiserTrace() {

    if (traceMarcheur) {
        carte.removeLayer(traceMarcheur);
        traceMarcheur = null;
    }

}

//--------------------------------------------------

function reinitialiserWaypoints() {

    waypoints = [];

    numeroWP = 1;

    if (groupeWaypoints) {
       
        groupeWaypoints.clearLayers();
       
    }

}

//--------------------------------------------------

function reinitialiserVariables() {
// Waypoints
    numeroWP = 1;
    waypointCourant = null;

    // Distance parcourue
    distanceCollecte = 0;
    dernierPointCollecte = null;
    traceParcourue = [];
    afficherDistanceCollecte();
}

//--------------------------------------------------

function reinitialiserGPX() {

    if (traceGPX && carte) {
        carte.removeLayer(traceGPX);
    }

    traceGPX = null;

    contenuGPX = null;

}

//--------------------------------------------------

function reinitialiserInterface() {

    document.getElementById("tdbCircuit").textContent = "-";
    document.getElementById("nbWaypoints").textContent = "0";
    document.getElementById("tdbPK").textContent = "0 m";
    document.getElementById("tdbEcart").textContent = "-- m";

   

}

// ==========================================
// Initialisation d'une nouvelle collecte
// ==========================================

function ouvrirFenetreInitialisation() {

    if (modeGPX.checked) {

        document.getElementById("nomCollecteInitial").value =
            nomBaseGPX + "_enrichi";

    } else {

        document.getElementById("nomCollecteInitial").value =
            nomTrace.value.trim();

    }

    document.getElementById("vitesseMoyenne").value = 3.5;

    document
        .getElementById("fenetreInitialisation")
        .classList.remove("cache");

}


function fermerFenetreInitialisation() {

    document
        .getElementById("fenetreInitialisation")
        .classList.add("cache");

}

function terminerCollecte() {

  let resume = "";

resume += "<p><b>Nom de la collecte :</b><br>" +
          nomCollecte + "</p>";

resume += "<p><b>Date :</b><br>" +
          new Date().toLocaleDateString("fr-FR") + "</p>";

resume += "<p><b>Nombre de waypoints :</b><br>" +
          waypoints.length + "</p>";

    document.getElementById("resumeFinCollecte").innerHTML = resume;

    document.getElementById("fenetreFinCollecte")
            .classList.remove("cache");


}


function continuerCollecte() {

    document
        .getElementById("fenetreFinCollecte")
        .classList.add("cache");

}

async function archiverCollecte() {

    const collecte = construireObjetCollecte();

    // =============================================
    // Création et export du ZIP unique
    // =============================================

    const succes =
        await exporterCollecteZIP(collecte);

    // =============================================
    // Si le ZIP n'a pas pu être créé
    // =============================================

    if (!succes) {

        alert(
            "⚠️ La collecte n'a pas été supprimée.\n\n" +
            "Le fichier ZIP n'a pas pu être créé.\n" +
            "La collecte reste sauvegardée sur ce téléphone."
        );

        return;
    }

    // =============================================
    // ZIP créé : collecte terminée
    // =============================================

    alert(
        "✅ Cette collecte est terminée.\n\n" +
        "Le fichier suivant a été créé :\n\n" +
        "📦 " +
        collecte.nomCollecte +
          ".zip\n\n" +
        "Il contient :\n" +
        "• la sauvegarde CDSI69\n" +
        "• le fichier Excel\n" +
        "• le GPX enrichi\n" +
        "• les photos dans le dossier Photos"
    );

    // =============================================
    // Nettoyage après réussite
    // =============================================

    nettoyerCollecteInterrompue();

    reinitialiserVariables();
    reinitialiserTrace();
    reinitialiserWaypoints();
    reinitialiserGPX();
    reinitialiserInterface();
    fermerFenetreFinCollecte();
    majInterface();

    document.getElementById("cdsi_preparation").style.display =
        "block";

    document.getElementById("cdsi_collecte").style.display =
        "none";

    document.getElementById("nomTrace").value = "";

    document.getElementById("nomGPX").textContent =
        "Aucun circuit sélectionné";
}


function fermerFenetreFinCollecte() {
    
    document.getElementById("fenetreFinCollecte")
            .classList.add("cache");
}

const SEUIL_DENIVELE = 3;

function calculerDenivele(trace) {

    let denivelePositif = 0;
    let deniveleNegatif = 0;

    let altitudeReference = null;

    trace.forEach(function(point) {

        const altitude = Number(point.altitude);

        if (!Number.isFinite(altitude)) {
            return;
        }

        if (altitudeReference === null) {
            altitudeReference = altitude;
            return;
        }

        const difference =
            altitude - altitudeReference;

        if (Math.abs(difference) >= SEUIL_DENIVELE) {

            if (difference > 0) {
                denivelePositif += difference;
            } else {
                deniveleNegatif += Math.abs(difference);
            }

            altitudeReference = altitude;
               }
    });

    return {
        denivelePositif: denivelePositif,
        deniveleNegatif: deniveleNegatif
    };
}

function calculerStatistiquesCollecte(collecte) {

    const denivele =
        calculerDenivele(collecte.traceParcourue || []);

    let distanceAgglo = 0;
    let distanceHorsAgglo = 0;
    let distanceRevetu = 0;
    let distanceNonRevetu = 0;

    const waypoints = collecte.waypoints;

    for (let i = 0; i < waypoints.length - 1; i++) {

        const wpCourant = waypoints[i];
        const wpSuivant = waypoints[i + 1];

        const distance =
            Math.abs(
                Number(wpSuivant.pk) -
                Number(wpCourant.pk)
            );

        if (wpCourant.agglo === "H") {
            distanceHorsAgglo += distance;
        } else {
            distanceAgglo += distance;
        }

        if (wpCourant.cheminement === "R") {
            distanceRevetu += distance;
        } else {
            distanceNonRevetu += distance;
        }

    }

    const distanceTotale =
        distanceAgglo + distanceHorsAgglo;

    const pourcentageAgglo =
        distanceTotale > 0
            ? distanceAgglo * 100 / distanceTotale
            : 0;
    const pourcentageHorsAgglo =
        distanceTotale > 0
            ? distanceHorsAgglo * 100 / distanceTotale
            : 0;

    const pourcentageRevetu =
        distanceTotale > 0
            ? distanceRevetu * 100 / distanceTotale
            : 0;

    const pourcentageNonRevetu =
        distanceTotale > 0
            ? distanceNonRevetu * 100 / distanceTotale
            : 0;

    return {

        distanceTotale,

        distanceAgglo,
        distanceHorsAgglo,

        distanceRevetu,
        distanceNonRevetu,

        pourcentageAgglo,
        pourcentageHorsAgglo,

        pourcentageRevetu,
        pourcentageNonRevetu,

        denivelePositif: denivele.denivelePositif,
        deniveleNegatif: denivele.deniveleNegatif

    };

}

function exporterExcel(collecte, pourZIP = false) {

    const stats =
    calculerStatistiquesCollecte(collecte);

 

  if (!collecte) {
        alert("Aucune collecte à exporter.");
        return;
    }


    // Création du classeur
    const wb = XLSX.utils.book_new();

    // Tableau qui représentera la feuille
    const donnees = [];

    // -------------------------------------------------
// Statistiques de la collecte
// -------------------------------------------------

let nombrePhotos = 0;
let distanceAgglo = 0;
let distanceHorsAgglo = 0;
let distanceRevetu = 0;
let distanceNonRevetu = 0;

collecte.waypoints.forEach(function (wp) {

    if (wp.photos) {

        nombrePhotos += wp.photos.length;

    }

});


const distanceTotale =
    (collecte.distanceCollecte / 1000).toFixed(2);

const pourcentageAgglo =
    distanceTotale > 0
        ? distanceAgglo * 100 / distanceTotale
        : 0;

const pourcentageHorsAgglo =
    distanceTotale > 0
        ? distanceHorsAgglo * 100 / distanceTotale
        : 0;

const pourcentageRevetu =
    distanceTotale > 0
        ? distanceRevetu * 100 / distanceTotale
        : 0;

const pourcentageNonRevetu =
    distanceTotale > 0
        ? distanceNonRevetu * 100 / distanceTotale
        : 0;


    // ----- Titre -----

donnees.push([
    "CDSI69 - FICHE DE COLLECTE DU CIRCUIT DE RANDONNÉE : " +
    collecte.nomCollecte
]);

    // ----- Informations générales -----

   // ----- En-tête de la fiche -----

// =====================================================
// EN-TÊTE DE LA FICHE
// =====================================================

donnees.push([
    "Commune de départ : " +
    informationsCollecte.commune,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Date : " +
    new Date(collecte.dateSauvegarde)
        .toLocaleDateString("fr-FR")
]);

donnees.push([
    "Lieu de départ : " +
    informationsCollecte.lieu,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Version : " +
    collecte.version
]);

donnees.push([
    "Accès : " +
    informationsCollecte.acces,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Collecteurs : " +
    informationsCollecte.collecteurs
]);

// =====================================================
// SYNTHÈSE
// =====================================================

donnees.push([]);

donnees.push([
    "📊 SYNTHÈSE DE LA COLLECTE"
]);

donnees.push([
    "Nombre de waypoints : " +
    collecte.waypoints.length,
    "",
    "",
    "",
    "",
    "",
    "",
    "Dénivelé : +" +
    stats.denivelePositif.toFixed(0) +
    " m / -" +
    stats.deniveleNegatif.toFixed(0) +
    " m"
]);

const distanceKm = stats.distanceTotale / 1000;

const tempsHeures =
    distanceKm / informationsCollecte.vitesse;

const heures =
    Math.floor(tempsHeures);

const minutes =
    Math.round((tempsHeures - heures) * 60);

const tempsEstime =
    heures + " h " +
    String(minutes).padStart(2, "0") +
    " min";

donnees.push([
    "Nombre de photos : " +
    nombrePhotos,
    "",
    "",
    "",
    "",
    "",
    "",
   "Temps estimé (" +
informationsCollecte.vitesse +
" km/h) : " +
tempsEstime
]);

donnees.push([
"Distance totale : " +
(stats.distanceTotale / 1000).toFixed(2) +
" km"
]);

donnees.push([
    "En agglomération : " +
    (stats.distanceAgglo / 1000).toFixed(2) +
    " km (" +
    stats.pourcentageAgglo.toFixed(1) +
    " %)",
    "",
    "",
    "",
    "",
    "",
    "",
    "Hors agglomération : " +
    (stats.distanceHorsAgglo / 1000).toFixed(2) +
    " km (" +
    stats.pourcentageHorsAgglo.toFixed(1) +
    " %)"
]);

donnees.push([
    "Revêtu : " +
    (stats.distanceRevetu / 1000).toFixed(2) +
    " km (" +
    stats.pourcentageRevetu.toFixed(1) +
    " %)",
    "",
    "",
    "",
    "",
    "",
    "",
    "Non revêtu : " +
    (stats.distanceNonRevetu / 1000).toFixed(2) +
    " km (" +
    stats.pourcentageNonRevetu.toFixed(1) +
    " %)"
]);

donnees.push([]);

donnees.push([
    "📍 DÉTAIL DES WAYPOINTS"
]);


donnees.push([]);

   donnees.push(COLONNES_EXCEL);

collecte.waypoints.forEach(function (wp) {

    // WP supprimé
    if (wp.supprime === true) {

        donnees.push([
            wp.numero,
            "WP supprimé par l'utilisateur",
            
        ]);

        return;
    }

    // WP normal
    donnees.push([
        wp.numero,
        wp.balisage === "Autre"
            ? wp.balisageAutre
            : wp.balisage,

        wp.agglo,
        wp.cheminement,

        wp.signaletique === "AUTRE"
              ? wp.signaletiqueAutre
            : wp.signaletique,

        wp.securite === "AUTRE"
            ? wp.securiteAutre
            : wp.securite,

        wp.nuisances === "AUTRE"
            ? wp.autreNuisance
            : wp.nuisances,

        wp.obsNuisance,
        wp.poiPov,
        wp.pasAPas,
        wp.pk,
        wp.entrePas,

        wp.photos
            .map(function(photo) {

                return (
                    photo.reference +
                    " : " +
                    photo.commentaire
                );

            })
            .join("\n")
    ]);

});     

// Ligne vide


// Création de la feuille

const ws = XLSX.utils.aoa_to_sheet(donnees);

// =====================================================
//1 - STYLES DE LA FEUILLE EXCEL
// =====================================================

// ----- Grand titre -----

const styleGrandTitre = {

    font: {
        bold: true,
        sz: 18,
        color: { rgb: "FFFFFF" }
    },

    fill: {
        patternType: "solid",
        fgColor: { rgb: "1F4E78" }
    },

    alignment: {
        horizontal: "center",
        vertical: "center"
    }

};

// ----- Titres de blocs -----

const styleTitreBloc = {

    font: {
        bold: true,
        sz: 13,
        color: { rgb: "FFFFFF" }
    },

    fill: {
        patternType: "solid",
        fgColor: { rgb: "1F4E78" }
    },

    alignment: {
        horizontal: "center",
        vertical: "center"
    }

};

// ----- Libellés -----

const styleLibelle = {

    font: {
        bold: true
    },

    alignment: {
        vertical: "center"
    }

};

// ----- Texte -----

const styleTexte = {

    alignment: {
        vertical: "center"
    }

};

// ----- Entête du tableau -----

const styleEnteteTableau = {

    font: {
        bold: true,
        color: { rgb: "FFFFFF" }
    },

    fill: {
        patternType: "solid",
        fgColor: { rgb: "4F81BD" }
    },

    alignment: {
        horizontal: "center",
        vertical: "center"
    }

};




// =====================================================
// 2 -  APPLICATION DES STYLES
// =====================================================

ws["A1"].s = styleGrandTitre;

ws["A6"].s  = styleTitreBloc;
ws["A13"].s = styleTitreBloc;
["A2","A3","A4","J2","J3","J4"].forEach(function(cellule){

    if (ws[cellule]) {
        ws[cellule].s = styleLibelle;
    }

});

[
"A7","H7",
"A8","H8",
"A9",
"A10","H10",
"A11","H11"
].forEach(function(cellule){

    if (ws[cellule]) {
        ws[cellule].s = styleTexte;
    }

});

[
"A15","B15","C15","D15","E15","F15",
"G15","H15","I15","J15","K15","L15","M15"
].forEach(function(cellule){

    if (ws[cellule]) {
        ws[cellule].s = styleEnteteTableau;
    }

});

// =====================================================
// ALTERNANCE DES COULEURS DES LIGNES
// =====================================================

for (let ligne = 16; ligne <= 15 + collecte.waypoints.length; ligne++) {

    if (ligne % 2 === 0) {

        for (let colonne = 0; colonne <= 12; colonne++) {

            const cellule = XLSX.utils.encode_cell({
                r: ligne - 1,
                c: colonne
            });

            if (ws[cellule]) {

                ws[cellule].s = {
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "D9EAF7" }
                    }
                };

            }
        }
    }
}

// =====================================================
// AFFICHAGE VERTICAL DES PHOTOS
// =====================================================

for (
    let ligne = 16;
    ligne <= 15 + collecte.waypoints.length;
    ligne++
) {

    const cellule = XLSX.utils.encode_cell({
        r: ligne - 1,
        c: 12
    });

    if (ws[cellule]) {

        ws[cellule].s = {
            alignment: {
                vertical: "top",
                wrapText: true
            }
        };

    }

}


// =====================================================
// FUSIONS DE LA FEUILLE EXCEL
// =====================================================

ws["!merges"] = [

    // Grand titre
    { s:{r:0,c:0},  e:{r:0,c:12} },

    // Informations générales
    { s:{r:1,c:0},  e:{r:1,c:7} },    // A2:H2
    { s:{r:1,c:9},  e:{r:1,c:12} },   // J2:M2

    { s:{r:2,c:0},  e:{r:2,c:7} },    // A3:H3
    { s:{r:2,c:9},  e:{r:2,c:12} },   // J3:M3

    { s:{r:3,c:0},  e:{r:3,c:7} },    // A4:H4
    { s:{r:3,c:9},  e:{r:3,c:12} },   // J4:M4

    // Synthèse
    { s:{r:5,c:0},  e:{r:5,c:12} },   // A6:M6

    { s:{r:6,c:0},  e:{r:6,c:6} },    // A7:G7
    { s:{r:6,c:7},  e:{r:6,c:12} },   // H7:M7

    { s:{r:7,c:0},  e:{r:7,c:6} },    // A8:G8
    { s:{r:7,c:7},  e:{r:7,c:12} },   // H8:M8

    { s:{r:8,c:0},  e:{r:8,c:12} },   // A9:M9

    { s:{r:9,c:0},  e:{r:9,c:6} },    // A10:G10
    { s:{r:9,c:7},  e:{r:9,c:12} },   // H10:M10

    { s:{r:10,c:0}, e:{r:10,c:6} },   // A11:G11
    { s:{r:10,c:7}, e:{r:10,c:12} },  // H11:M11

// Titre du tableau
{ s:{r:12,c:0}, e:{r:12,c:12} },   // A13:M13

// Lignes vides
{ s:{r:4,c:0},  e:{r:4,c:12} },    // A5:M5
{ s:{r:11,c:0}, e:{r:11,c:12} },   // A12:M12
{ s:{r:13,c:0}, e:{r:13,c:12} }    // A14:M14
];

// =====================================================
// LARGEUR DES COLONNES
// =====================================================

ws["!cols"] = [
    { wch: 4 },   // A - n°WP
    { wch: 7 },   // B - Balisage
    { wch: 6 },   // C - Agglo
    { wch: 13 },   // D - Cheminement
    { wch: 12 },   // E - Signalétique
    { wch: 15 },  // F - Sécurité
    { wch: 20 },  // G - Nuisances
    { wch: 40 },  // H - Précision nuisance
    { wch: 40 },  // I - POI/POV
    { wch: 40 },  // J - Pas à pas
    { wch: 5 },   // K - PK
    { wch: 10 },   // L - Entre pas
    { wch: 40 }   // M - Photos
];

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Collecte"
    );

 
if (pourZIP) {

    const contenuExcel = XLSX.write(
        wb,
        {
            bookType: "xlsx",
            type: "array"
        }
    );

    return new Blob(
        [contenuExcel],
        {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

}

XLSX.writeFile(
    wb,
    collecte.nomCollecte + ".xlsx"
);

}

document
    .getElementById("btnAide")
    .addEventListener("click", function () {

        window.open(
            "aide.html",
            "_blank"
        );

    });

   document
    .getElementById("btnFondCarte")
    .addEventListener("click", function () {

        if (carte.hasLayer(fondPlanIGN)) {

            carte.removeLayer(fondPlanIGN);
            fondOSM.addTo(carte);

            this.textContent = "🌍 OpenStreetMap";

        } else {

            carte.removeLayer(fondOSM);
            fondPlanIGN.addTo(carte);

            this.textContent = "🗺️ Plan IGN";

        }

    }); 

    // -------------------------------------------------
// SERVICE WORKER
// -------------------------------------------------

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker.register("/service-worker.js")

            .then(function () {

                console.log("Service Worker enregistré");

            })

            .catch(function (erreur) {

                console.error(
                    "Erreur Service Worker :",
                    erreur
                );

            });

    });

}