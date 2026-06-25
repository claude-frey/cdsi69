console.log("CDSI69");
// Création de la carte
// console.log("APP.JS CHARGE");
// alert("APP.JS CHARGE");
var carte = L.map('carte').setView([45.896, 4.433], 13);

// Fond OpenStreetMap

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        subdomains: ['a', 'b', 'c'],
        maxZoom: 22,
        attribution: '© OpenStreetMap'
    }
).addTo(carte);

// Variable contenant la trace affichée
let contenuGPX = "";
let traceGPX = null;
let pointsTrace = [];
let latitudeGPS = null;
let longitudeGPS = null;
let groupeWaypoints = L.layerGroup().addTo(carte);
let waypoints = [];
let waypointCourant = null;
let marqueurGPS = null;
let indexWaypointCourant = -1;
let nomGPX = "";
let nomBaseGPX = "";
let numeroWP = 1;
let suiviGPS = null;
let traceMarcheur = null;
let traceParcourue = [];
// Gestion du bouton d'ouverture GPX

document.getElementById('gpxFile').addEventListener('change', chargerGPX);
function chargerTexteGPX(texteGPX) {

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

        console.log("GPX chargé");

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

        document.getElementById(
            "distance"
        ).value = distanceKm;

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

        document.getElementById(
            "tempsMarche"
        ).value =
            heures + " h " +
            String(minutes)
            .padStart(2, "0");

        carte.fitBounds(
            traceGPX.getBounds()
        );

      //  sauvegardeAutomatique();

    });

    traceGPX.addTo(carte);

}
function chargerGPX(event) {

    const fichier = event.target.files[0];

    if (!fichier) return;
    waypoints = [];
    groupeWaypoints.clearLayers();
    waypointCourant = null;
    console.log(
    "waypointCourant remis à null"
);
indexWaypointCourant = -1;

document.getElementById(
    "nomItineraire"
).value = "";

document.getElementById(
    "communeDepart"
).value = "";

document.getElementById(
    "lieuDepart"
).value = "";

document.getElementById(
    "collecteurs"
).value = "";

document.getElementById(
    "acces"
).value = "";

document.getElementById("numeroWP")
    .textContent = "-";

document.getElementById("pk")
    .value = "";

document.getElementById("entrePas")
    .value = "";

document.getElementById("balisage")
    .value = "";

document.getElementById("agglo")
    .value = "";

document.getElementById("cheminement")
    .value = "";

document.getElementById("signaletique")
    .value = "";

document.getElementById("securite")
    .value = "";

document.getElementById("nuisances")
    .value = "";

document.getElementById("poiPov")
    .value = "";

document.getElementById("pasAPas")
    .value = "";
    nomGPX = fichier.name;

    nomBaseGPX =
    nomGPX.replace(
        /\.gpx$/i,
        ""
    );
    document.getElementById(
    "nomItineraire"
).value = nomBaseGPX;
    document.getElementById(
    "nomGPXAffiche"
).textContent =
    nomBaseGPX;

console.log(
    "Nom GPX =",
    nomGPX
);

console.log(
    "Nom de base =",
    nomBaseGPX
);
	numeroWP = 1;

    const lecteur = new FileReader();

    lecteur.onload = function(e) {

        contenuGPX = e.target.result;

chargerTexteGPX(
    contenuGPX
);
    };

    lecteur.readAsText(fichier);

}

    

carte.on('click', ajouterWaypoint);

function ajouterWaypoint(e) {
    indexWaypointCourant = -1;

    const latitude = e.latlng.lat;
    const longitude = e.latlng.lng;

    let distanceMin = Infinity;

    pointsTrace.forEach(function(point) {

        let distance =
            e.latlng.distanceTo(point);

        if (distance < distanceMin) {
            distanceMin = distance;
        }

    });

    let segmentInfo =
        segmentLePlusProcheGPX(
            e.latlng
        );
console.log(
    "Segment GPS trouvé =",
    segmentInfo.segment
);

console.log(
    "Distance GPS-trace =",
    segmentInfo.distance
);
    console.log(
        "Segment trouvé :",
        segmentInfo.segment
    );

    console.log(
        "Distance segment :",
        segmentInfo.distance
    );
   let pkCalcule =
    pkWaypoint(
        e.latlng,
        segmentInfo.segment
    );
    if (
    waypoints.length === 1 &&
    pkCalcule < Number(waypoints[0].pk)
) {

    let continuer = confirm(
        "Le relevé semble partir dans le sens inverse du GPX.\n\nVoulez-vous continuer ?"
    );

    if (!continuer) {

        return;

    }

}
    console.log(
    "Nb WP existants =",
    waypoints.length
);
    let entrePasCalcule = 0;

    if (waypoints.length > 0) {
console.log(
    "PK précédent =",
    waypoints[
        waypoints.length - 1
    ].pk
);
    let pkPrecedent =
        Number(
            waypoints[
                waypoints.length - 1
            ].pk
        );

    entrePasCalcule =
        Math.abs(
            Math.round(pkCalcule)
            - pkPrecedent
        );

}
console.log(
    "EntrePas calculé =",
    entrePasCalcule
);
document.getElementById("pk").value =
    Math.round(pkCalcule);
document.getElementById("entrePas").value =
    entrePasCalcule;
console.log(
    "Champ EntrePas =",
    document.getElementById("entrePas").value
);
console.log(
    "PK calculé :",
    Math.round(pkCalcule)
);

  // Contrôle supprimé :
// le waypoint est désormais
// accepté à la position GPS réelle

    console.log("pkCalcule =", pkCalcule);
    waypointCourant = {
	
    numero: numeroWP,

    latitude: latitude,
    longitude: longitude,
    
    ecartGPX:
    Math.round(
        segmentInfo.distance
    ),

    balisage: "",
    agglo: "",
    cheminement: "",
    signaletique: "",
    pk: Math.round(pkCalcule),
    entrePas: "",
    securite: "",
    nuisances: "",
    poiPov: "",
    pasAPas: "",
	marqueur: null,


	
};

   let marqueur = L.marker([latitude, longitude])
    .addTo(groupeWaypoints);
	waypointCourant.marqueur = marqueur;
    marqueur.numeroWP = numeroWP;
   marqueur.on("click", function() {

    let wp = waypoints.find(
        w => w.numero === marqueur.numeroWP
    );

    if (wp) {

      
        ouvrirWaypoint(wp);

    }

});
document.getElementById("numeroWP").textContent = numeroWP;
document.getElementById("balisage").value = "";document.getElementById("agglo").value = "";
document.getElementById("cheminement").value = "";n:
document.getElementById("signaletique").value = "";
document.getElementById("pk").value =
    Math.round(pkCalcule);
document.getElementById("entrePas").value = "";
document.getElementById("securite").value = "";
document.getElementById("nuisances").value = "";
document.getElementById("poiPov").value = "";
document.getElementById("pasAPas").value = "";

    numeroWP++;

}
document
    .getElementById("btnEnregistrer")
    .addEventListener("click", enregistrerWaypoint);

document
    .getElementById("btnSupprimer")
    .addEventListener("click", supprimerWaypoint);    

document
    .getElementById("btnExporter")
    .addEventListener("click", exporterCSV);

document
    .getElementById("btnExporterGPX")
    .addEventListener("click", exporterGPX);

document
    .getElementById("btnGPS")
    .addEventListener("click", testerGPS);
document
    .getElementById("btnWPGPS")
    .addEventListener(
        "click",
        creerWaypointGPS
    );

document
    .getElementById("btnExporterTrace")
    .addEventListener(
        "click",
        exporterTraceReelle
    );   

function enregistrerWaypoint() {

    if (!waypointCourant) return;

    waypointCourant.balisage =
        document.getElementById("balisage").value;

    waypointCourant.agglo =
        document.getElementById("agglo").value;

    waypointCourant.cheminement =
        document.getElementById("cheminement").value;

    waypointCourant.signaletique =
        document.getElementById("signaletique").value;

    console.log(
    "PK avant écrasement =",
    waypointCourant.pk
);

console.log(
    "Champ HTML PK =",
    document.getElementById("pk").value
);

   if (
    document.getElementById("pk").value !== ""
) {

    waypointCourant.pk =
        document.getElementById("pk").value;

}

waypointCourant.entrePas =
    document.getElementById("entrePas").value;

    waypointCourant.securite =
    document.getElementById("securite").value;

waypointCourant.nuisances =
    document.getElementById("nuisances").value;

waypointCourant.poiPov =
    document.getElementById("poiPov").value;

waypointCourant.pasAPas =
    document.getElementById("pasAPas").value;

    console.log("Index avant enregistrement =", indexWaypointCourant);  
     if (waypoints.length > 0) {

    let pkPrecedent =
        Number(
            waypoints[
                waypoints.length - 1
            ].pk
        );

    let pkCourant =
        Number(
            waypointCourant.pk
        );

    waypointCourant.entrePas =
        Math.abs(
            pkCourant -
            pkPrecedent
        );

} 
console.log(
    "indexWaypointCourant =",
    indexWaypointCourant
);

console.log(
    "Nb WP avant =",
    waypoints.length
);
    if (indexWaypointCourant === -1) {

    waypoints.push(waypointCourant);

} else {

    waypoints[indexWaypointCourant] = waypointCourant;

}
console.log(
    "Nb WP après =",
    waypoints.length
);
waypoints.sort(
    (a, b) => Number(a.pk) - Number(b.pk)
);
sauvegardeAutomatique();

waypoints.forEach(
    function(wp, index) {

        wp.numero = index + 1;

        if (wp.marqueur) {

            wp.marqueur.numeroWP =
                wp.numero;

        }

    }
);
waypoints.forEach(
    function(wp, index) {

        if (index === 0) {

            wp.entrePas = 0;

        } else {

            wp.entrePas =
                Number(wp.pk)
                -
                Number(
                    waypoints[index - 1].pk
                );

        }

    }
);
console.log("Marqueurs :");

groupeWaypoints.getLayers().forEach(
    m => console.log(m.numeroWP)
);
console.log(
    waypoints.map(w => ({
        numero: w.numero,
        pk: w.pk
    }))
);

console.log(
    waypoints.map(w => ({
        numero: w.numero,
        pk: w.pk
    }))
);
console.log(
    waypoints.map(w => ({
        numero: w.numero,
        pk: w.pk
    }))
);
indexWaypointCourant = -1;
ouvrirWaypoint(waypointCourant);
    console.log(waypoints);

    console.log(
    "WP" +
    waypointCourant.numero +
    " enregistré"
);
alert(
    "Waypoint enregistré.\n\n" +
    "Écart au GPX de référence : " +
    waypointCourant.ecartGPX +
    " m"
);
}
    function ouvrirWaypoint(wp) {
        if (
    waypointCourant &&
    !waypoints.includes(waypointCourant)
) {

    alert(
        "Le nouveau waypoint n'a pas été enregistré.\n\nVeuillez l'enregistrer ou le supprimer avant d'ouvrir un autre waypoint."
    );

    return;

}
         waypointCourant = wp;
         console.log(
    "Ouverture WP",
    wp.numero
);
         indexWaypointCourant = waypoints.indexOf(wp);

    console.log("Ouverture WP", wp.numero);
    console.log("Index", waypoints.indexOf(wp));

    document.getElementById("numeroWP").textContent =
        wp.numero;

    document.getElementById("balisage").value =
        wp.balisage;

    document.getElementById("agglo").value =
        wp.agglo;

    document.getElementById("cheminement").value =
        wp.cheminement;

    document.getElementById("signaletique").value =
        wp.signaletique;
    document.getElementById("pk").value =
    wp.pk;

    document.getElementById("entrePas").value =
    wp.entrePas;    

    document.getElementById("securite").value =
    wp.securite;

    document.getElementById("nuisances").value =
    wp.nuisances;

    document.getElementById("poiPov").value =
    wp.poiPov;

    document.getElementById("pasAPas").value =
    wp.pasAPas;    
}
function supprimerWaypoint() {

    if (!waypointCourant) return;

    groupeWaypoints.removeLayer(
        waypointCourant.marqueur
    );

    let index = waypoints.indexOf(
        waypointCourant
    );

    if (index !== -1) {

        console.log(
    "Avant suppression :",
    waypoints.map(w => w.numero)
);

console.log(
    "Index supprimé :",
    index
);

        waypoints.splice(index, 1);

     console.log(
    "Après splice :",
    waypoints.map(w => w.numero)
);   
        console.log(
    "Index trouvé =",
    index
);

console.log(
    "WP courant =",
    waypointCourant.numero
);

        waypoints.sort(
            (a, b) => Number(a.pk) - Number(b.pk)
        );

        waypoints.forEach(
    function(wp, index) {

        wp.numero = index + 1;

        if (wp.marqueur) {

            wp.marqueur.numeroWP =
                wp.numero;

        }

    }
);
console.log(
    "Après renumérotation :",
    waypoints.map(w => w.numero)
);
numeroWP =
    waypoints.length + 1;

console.log(
    "Nouveau numeroWP =",
    numeroWP
);

console.log(
    "Marqueurs :"
);

groupeWaypoints.getLayers().forEach(
    m => console.log(m.numeroWP)
);

        console.log(
            waypoints.map(w => ({
                numero: w.numero,
                pk: w.pk
            }))
        );

    }

    waypointCourant = null;

    document.getElementById("numeroWP")
        .textContent = "-";

    document.getElementById("balisage")
        .value = "";

    document.getElementById("agglo")
        .value = "";

    document.getElementById("cheminement")
        .value = "";

    document.getElementById("signaletique")
        .value = "";

    console.log("Waypoint supprimé");

}
function exporterCSV() {
    console.log(waypoints);
    let contenu =

    "Nom itineraire;" +
    document.getElementById("nomItineraire").value +
    "\n" +

    "Date collecte;" +
    document.getElementById("dateCollecte").value +
    "\n" +

    "Commune depart;" +
    document.getElementById("communeDepart").value +
    "\n" +

    "Lieu depart;" +
    document.getElementById("lieuDepart").value +
    "\n" +

    "Collecteurs;" +
    document.getElementById("collecteurs").value +
    "\n" +

    "Acces;" +
    document.getElementById("acces").value +
    "\n" +

    "Distance;" +
    document.getElementById("distance").value +
    "\n" +

    "Temps de marche;" +
    document.getElementById("tempsMarche").value +
    "\n\n" +

    "Numero;Latitude;Longitude;Balisage;Agglo;Cheminement;Signaletique;PK;EntrePas;Securite;Nuisances;POI_POV;PasAPas\n";

    waypoints.forEach(function(wp) {

   contenu +=
    wp.numero + ";" +
    wp.latitude + ";" +
    wp.longitude + ";" +
    wp.balisage + ";" +
    wp.agglo + ";" +
    wp.cheminement + ";" +
    wp.signaletique + ";" +
    wp.pk + ";" +
    wp.entrePas + ";" +
    wp.securite + ";" +
    wp.nuisances + ";" +
    wp.poiPov + ";" +
    wp.pasAPas +
    "\n";
    });
console.log(contenu);
    let blob = new Blob(
        [contenu],
        { type: "text/csv;charset=utf-8;" }
    );

    let lien = document.createElement("a");

    lien.href = URL.createObjectURL(blob);

    lien.download =
    (nomBaseGPX || "waypoints")
    + ".csv";
    
    lien.click();
    alert(
    "CSV exporté"
);

}
function longueurTrace() {

    let total = 0;

    for (let i = 0; i < pointsTrace.length - 1; i++) {

        total += carte.distance(
            pointsTrace[i],
            pointsTrace[i + 1]
        );

    }

    return total;

}
function longueurSegment(indice) {

    return carte.distance(
        pointsTrace[indice],
        pointsTrace[indice + 1]
    );

}
function pkPoint(indice) {

    let pk = 0;

    for (let i = 0; i < indice; i++) {

        pk += longueurSegment(i);

    }

    return pk;
    }
   
function segmentLePlusProche(point) {

    let distanceMin = Infinity;
    let segmentMin = -1;

    for (let i = 0; i < pointsTrace.length - 1; i++) {

        let pointA = pointsTrace[i];

        let distance =
            carte.distance(
                point,
                pointA
            );

        if (distance < distanceMin) {

            distanceMin = distance;
            segmentMin = i;

        }

    }

    console.log(
        "Segment proche :",
        segmentMin
    );

    console.log(
        "Distance :",
        Math.round(distanceMin),
        "m"
    );

}
function milieuSegment(indice) {

    return L.latLng(
        (pointsTrace[indice].lat +
         pointsTrace[indice + 1].lat) / 2,

        (pointsTrace[indice].lng +
         pointsTrace[indice + 1].lng) / 2
    );

}
function coordonneesLocales(point, origine) {

    let x = carte.distance(
        L.latLng(
            origine.lat,
            origine.lng
        ),
        L.latLng(
            origine.lat,
            point.lng
        )
    );

    let y = carte.distance(
        L.latLng(
            origine.lat,
            origine.lng
        ),
        L.latLng(
            point.lat,
            origine.lng
        )
    );

    if (point.lng < origine.lng) {
        x = -x;
    }

    if (point.lat < origine.lat) {
        y = -y;
    }

    return {
        x: x,
        y: y
    };

}
function longueurXY(point) {

    return Math.sqrt(
        point.x * point.x +
        point.y * point.y
    );

}
function distancePointSegmentMilieu(
    point,
    indiceSegment
) {

    let milieu =
        milieuSegment(indiceSegment);

    return carte.distance(
        point,
        milieu
    );

}
function projectionSurSegment(
    point,
    pointA,
    pointB
) {

    let APx = point.x - pointA.x;
    let APy = point.y - pointA.y;

    let ABx = pointB.x - pointA.x;
    let ABy = pointB.y - pointA.y;

    let AB2 =
        ABx * ABx +
        ABy * ABy;

    if (AB2 < 0.01) {
        return 0;
    }

    let t =
        (APx * ABx +
         APy * ABy) / AB2;

    return t;

}
function pointProjeteSurSegment(
    pointA,
    pointB,
    t
) {

    return {

        x:
            pointA.x +
            t * (
                pointB.x -
                pointA.x
            ),

        y:
            pointA.y +
            t * (
                pointB.y -
                pointA.y
            )

    };

}
function distancePointSegmentXY(
    point,
    pointA,
    pointB
) {

    let t =
        projectionSurSegment(
            point,
            pointA,
            pointB
        );

    if (t < 0) {
        t = 0;
    }

    if (t > 1) {
        t = 1;
    }

    let projete =
        pointProjeteSurSegment(
            pointA,
            pointB,
            t
        );

    let dx =
        point.x - projete.x;

    let dy =
        point.y - projete.y;
  return Math.sqrt(
        dx * dx +
        dy * dy
    );

}
function distancePointSegmentGPX(
    point,
    indiceSegment
) {

    let A = { x: 0, y: 0 };

    let B =
        coordonneesLocales(
            pointsTrace[indiceSegment + 1],
            pointsTrace[indiceSegment]
        );

    let P =
        coordonneesLocales(
            point,
            pointsTrace[indiceSegment]
        );

    return distancePointSegmentXY(
        P,
        A,
        B
    );

}
function segmentLePlusProcheGPX(point) {

    let distanceMin = Infinity;
    let segmentMin = -1;

    for (
        let i = 0;
        i < pointsTrace.length - 1;
        i++
    ) {

        let longueur =
            longueurSegment(i);

        if (longueur < 0.01) {
            continue;
        }

        let distance =
            distancePointSegmentGPX(
                point,
                i
            );

        if (distance < distanceMin) {

            distanceMin = distance;
            segmentMin = i;

        }

    }

   return {

    segment: segmentMin,

    distance: distanceMin

};
}
function positionDansSegmentGPX(
    point,
    indiceSegment
) {

    let A = { x: 0, y: 0 };

    let B =
        coordonneesLocales(
            pointsTrace[indiceSegment + 1],
            pointsTrace[indiceSegment]
        );

    let P =
        coordonneesLocales(
            point,
            pointsTrace[indiceSegment]
        );

    return projectionSurSegment(
        P,
        A,
        B
    );

}
function pkSegment(indiceSegment) {

    let pk = 0;

    for (
        let i = 0;
        i < indiceSegment;
        i++
    ) {

        pk += longueurSegment(i);

    }

    return pk;

}
function pkWaypoint(
    point,
    indiceSegment
) {

    let t =
        positionDansSegmentGPX(
            point,
            indiceSegment
        );

    return (
        pkSegment(indiceSegment)
        +
        t * longueurSegment(
            indiceSegment
        )
    );

}
document.getElementById("dateCollecte").value =
    new Date().toISOString().split("T")[0]
    function sauvegarderReleve() {
 console.log("Sauvegarde lancée");
 console.log(
    document.getElementById("nomItineraire")
);

console.log(
    document.getElementById("dateCollecte")
);

console.log(
    document.getElementById("CommuneDepart")
);

console.log(
    document.getElementById("lieuDepart")
);

console.log(
    document.getElementById("Collecteurs")
);

console.log(
    document.getElementById("acces")
);

console.log(
    document.getElementById("distance")
);

console.log(
    document.getElementById("tempsMarche")
);
    let releve = {

        ficheReleve: {

            nomItineraire:
                document.getElementById(
                    "nomItineraire"
                ).value,

            dateCollecte:
                document.getElementById(
                    "dateCollecte"
                ).value,

            communeDepart:
                document.getElementById(
                    "communeDepart"
                ).value,

            lieuDepart:
                document.getElementById(
                    "lieuDepart"
                ).value,

            collecteurs:
                document.getElementById(
                    "collecteurs"
                ).value,

            acces:
                document.getElementById(
                    "acces"
                ).value,

            distance:
                document.getElementById(
                    "distance"
                ).value,

            tempsMarche:
                document.getElementById(
                    "tempsMarche"
                ).value

        },

      waypoints: waypoints.map(wp => ({

    numero: wp.numero,

    latitude: wp.latitude,
    longitude: wp.longitude,

    balisage: wp.balisage,
    agglo: wp.agglo,
    cheminement: wp.cheminement,
    signaletique: wp.signaletique,

    pk: wp.pk,
    entrePas: wp.entrePas,

    securite: wp.securite,
    nuisances: wp.nuisances,

    poiPov: wp.poiPov,
    pasAPas: wp.pasAPas

})),

        contenuGPX: contenuGPX

    };

    let texte =
        JSON.stringify(
            releve,
            null,
            2
        );

    let blob = new Blob(
        [texte],
        {
            type:
            "application/json"
        }
    );

    let lien =
        document.createElement("a");

    lien.href =
        URL.createObjectURL(blob);

    lien.download =
    (nomBaseGPX || "releve")
    + ".json";

lien.click();
alert(
    "Relevé sauvegardé"
);

}
document
    .getElementById(
        "btnSauvegarder"
    )
    .addEventListener(
        "click",
        sauvegarderReleve
    );
    document
    .getElementById("btnOuvrir")
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "fichierReleve"
                )
                .click();

        }
    );
    document
    .getElementById(
        "fichierReleve"
    )
    .addEventListener(
        "change",
        ouvrirReleve
    );
   function ouvrirReleve(event) {
alert("ouvrirReleve");
    const fichier =
        event.target.files[0];

    if (!fichier) return;

    const lecteur =
        new FileReader();

    lecteur.onload =
        function(e) {

            const releve =
                JSON.parse(
                    e.target.result
                );
                alert("JSON lu");

console.log("JSON lu");
console.log(releve);
            // =====================
            // Restauration fiche
            // =====================

            document.getElementById(
                "nomItineraire"
            ).value =
                releve.ficheReleve.nomItineraire;

            document.getElementById(
                "dateCollecte"
            ).value =
                releve.ficheReleve.dateCollecte;

            document.getElementById(
                "communeDepart"
            ).value =
                releve.ficheReleve.communeDepart;

            document.getElementById(
                "lieuDepart"
            ).value =
                releve.ficheReleve.lieuDepart;

            document.getElementById(
                "collecteurs"
            ).value =
                releve.ficheReleve.collecteurs;

            document.getElementById(
                "acces"
            ).value =
                releve.ficheReleve.acces;

            document.getElementById(
                "distance"
            ).value =
                releve.ficheReleve.distance;

            document.getElementById(
                "tempsMarche"
            ).value =
                releve.ficheReleve.tempsMarche;

            console.log(
                "Fiche restaurée"
            );

            // =====================
            // Restauration GPX
            // =====================

            contenuGPX =
                releve.contenuGPX;
              alert("GPX récupéré");  

            const blob =
                new Blob(
                    [contenuGPX],
                    {
                        type:
                        "application/gpx+xml"
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            if (traceGPX) {

                carte.removeLayer(
                    traceGPX
                );

            }
alert("Création trace");
            traceGPX =
                omnivore.gpx(url);

            traceGPX.on(
                "ready",
                function() {

                    pointsTrace =
                        Object.values(
                            traceGPX._layers
                        )[0]._latlngs;

                    carte.fitBounds(
                        traceGPX.getBounds()
                    );

                    console.log(
                        "Trace restaurée"
                        
                    );
console.log(
    "Nombre de waypoints :",
    releve.waypoints.length
);
releve.waypoints.forEach(
    function(wp) {

        let marqueur =
            L.marker(
                [
                    wp.latitude,
                    wp.longitude
                ]
            ).addTo(
                groupeWaypoints
            );

        marqueur.on(
    "click",
    function() {

        ouvrirWaypoint(wp);

    }
)
    }
);
                }
            );

            traceGPX.addTo(carte);

        };

    lecteur.readAsText(
        fichier
    );

}
document
    .getElementById(
        "fichierReleve"
    )
    .addEventListener(
        "change",
        ouvrirReleve
    );
    
function exporterGPX() {

    let gpxEnrichi =
        contenuGPX;

    let waypointsGPX = "";

    waypoints.forEach(function(wp) {

       waypointsGPX +=
    '\n<wpt lat="' +
    wp.latitude +
    '" lon="' +
    wp.longitude +
    '">\n' +

    '  <name>WP' +
    wp.numero +
    '</name>\n' +

    '  <desc>\n' +

'PK=' + wp.pk + '\n' +
'EntrePas=' + wp.entrePas + '\n' +
'Balisage=' + wp.balisage + '\n' +
'Agglo=' + wp.agglo + '\n' +
'Cheminement=' + wp.cheminement + '\n' +
'Signaletique=' + wp.signaletique + '\n' +
'Securite=' + wp.securite + '\n' +
'Nuisances=' + wp.nuisances + '\n' +
'POI=' + wp.poiPov + '\n' +
'PasAPas=' + wp.pasAPas +

'</desc>\n'+

    '</wpt>\n';
    });

    gpxEnrichi =
        gpxEnrichi.replace(
            "</gpx>",
            waypointsGPX +
            "\n</gpx>"
        );

    let blob =
        new Blob(
            [gpxEnrichi],
            {
                type:
                "application/gpx+xml"
            }
        );

    let lien =
        document.createElement("a");

    lien.href =
        URL.createObjectURL(blob);

    lien.download =
    (nomBaseGPX || "trace")
    + "_enrichie.gpx";

    lien.click();
    alert(
    "GPX exporté"
);

}
function testerGPS() {

    if (suiviGPS) {

        navigator.geolocation.clearWatch(
            suiviGPS
        );

        suiviGPS = null;
        document.getElementById(
        "precisionGPS"
        ).textContent = "";
        document.getElementById(
            "btnGPS"
        ).textContent =
            "GPS OFF";

        alert(
            "Suivi GPS arrêté"
        );
        alert(
    "Suivi GPS arrêté"
);

        return;

    }
traceParcourue = [];

console.log(
    "Nouvelle trace démarrée"
);
traceMarcheur =
    L.polyline(
        [],
        {
            color: "red",
            weight: 4
        }
    ).addTo(carte);
    suiviGPS =
        navigator.geolocation.watchPosition(

            function(position) {

                let latitude =
                    position.coords.latitude;

                let longitude =
                    position.coords.longitude;
                   console.log(
    "GPS brut :",
    position.coords.latitude,
    position.coords.longitude
);

console.log(
    "GPS précision :",
    position.coords.accuracy
);
   traceParcourue.push({

    latitude:
        Number(
            latitude.toFixed(6)
        ),

    longitude:
        Number(
            longitude.toFixed(6)
        ),

    dateHeure:
        new Date()
        .toISOString()

});

console.log(
    "Points traceParcourue :",
    traceParcourue.length
);


traceMarcheur.addLatLng(
    [
        latitude,
        longitude
    ]
);
console.log(
    "Points trace rouge :",
    traceMarcheur.getLatLngs().length
);
                let precision =
                Math.round(
                    position.coords.accuracy
    );

document.getElementById(
    "precisionGPS"
).textContent =
    " (" + precision + " m)";

                latitudeGPS =
                    latitude;

                longitudeGPS =
                    longitude;

                console.log(
    "GPS reçu :",
    latitude,
    longitude,
    new Date().toLocaleTimeString()
);

    if (marqueurGPS) {

    marqueurGPS.setLatLng(
        [
            latitude,
            longitude
        ]
    );

    console.log(
        "Marqueur déplacé"
    );


}   else {

                     marqueurGPS =
        L.circleMarker(
            [
                latitude,
                longitude
            ],
            {
                radius: 12,
                color: "white",
                weight: 3,
                fillColor: "red",
                fillOpacity: 1
            }
        )
        .addTo(carte);

}

  //              carte.panTo(
  //  [
  //      latitude,
  //      longitude
  //  ]
//);
//console.log(
//    "Carte recentrée"
//);
            },

            function(erreur) {

               alert(
    "GPS refusé ou indisponible : "
    + erreur.message
);

console.log(
    erreur
)

            },

            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }

        );

    document.getElementById(
        "btnGPS"
    ).textContent =
        "GPS ON";

}
function creerWaypointGPS() {

    if (
        latitudeGPS === null ||
        longitudeGPS === null
    ) {

        alert(
            "Cliquez d'abord sur GPS"
        );

        return;

    }
console.log(
    "GPS :",
    latitudeGPS,
    longitudeGPS
);

ajouterWaypoint(
    {
        latlng: {
            lat: latitudeGPS,
            lng: longitudeGPS
        }
    }
);
}
 function sauvegardeAutomatique() {

    let releve = {

        ficheReleve: {

            nomItineraire:
                document.getElementById(
                    "nomItineraire"
                ).value,

            dateCollecte:
                document.getElementById(
                    "dateCollecte"
                ).value,

            communeDepart:
                document.getElementById(
                    "communeDepart"
                ).value,

            lieuDepart:
                document.getElementById(
                    "lieuDepart"
                ).value,

            collecteurs:
                document.getElementById(
                    "collecteurs"
                ).value,

            acces:
                document.getElementById(
                    "acces"
                ).value,

            distance:
                document.getElementById(
                    "distance"
                ).value,

            tempsMarche:
                document.getElementById(
                    "tempsMarche"
                ).value

        },

        waypoints: waypoints.map(wp => ({

            numero: wp.numero,

            latitude: wp.latitude,
            longitude: wp.longitude,

            balisage: wp.balisage,
            agglo: wp.agglo,
            cheminement: wp.cheminement,
            signaletique: wp.signaletique,

            pk: wp.pk,
            entrePas: wp.entrePas,

            securite: wp.securite,
            nuisances: wp.nuisances,

            poiPov: wp.poiPov,
            pasAPas: wp.pasAPas

        })),
        
contenuGPX: contenuGPX,
nomBaseGPX: nomBaseGPX,


    };

    localStorage.setItem(
        "CDSI69_Autosave",
        JSON.stringify(releve)
    );

    console.log(
        "Sauvegarde automatique"
    );

}
function restaurerSauvegardeAutomatique() {

    let texte =
        localStorage.getItem(
            "CDSI69_Autosave"
        );

    if (!texte) {

        console.log(
            "Aucune sauvegarde automatique"
        );

        return;
    }

    if (
        !confirm(
            "Une sauvegarde automatique a été trouvée.\n\nLa restaurer ?"
        )
    ) {
        return;
    }

    let releve =
        JSON.parse(texte);
     console.log(
    "GPX restauré =",
    releve.contenuGPX
        ? "OUI"
        : "NON"
);   

    document.getElementById(
        "nomItineraire"
    ).value =
        releve.ficheReleve.nomItineraire || "";

    document.getElementById(
        "dateCollecte"
    ).value =
        releve.ficheReleve.dateCollecte || "";

    document.getElementById(
        "communeDepart"
    ).value =
        releve.ficheReleve.communeDepart || "";

    document.getElementById(
        "lieuDepart"
    ).value =
        releve.ficheReleve.lieuDepart || "";

    document.getElementById(
        "collecteurs"
    ).value =
        releve.ficheReleve.collecteurs || "";

    document.getElementById(
        "acces"
    ).value =
        releve.ficheReleve.acces || "";

    document.getElementById(
        "distance"
    ).value =
        releve.ficheReleve.distance || "";

    document.getElementById(
        "tempsMarche"
    ).value =
        releve.ficheReleve.tempsMarche || "";

   waypoints =
    releve.waypoints || [];

    if (waypoints.length > 0) {

    numeroWP =
        Math.max(
            ...waypoints.map(
                wp => Number(wp.numero)
            )
        ) + 1;

} else {

    numeroWP = 1;

}

console.log(
    "numeroWP restauré =",
    numeroWP
);

nomBaseGPX =
    releve.nomBaseGPX || "";

let zoneNom =
    document.getElementById(
        "nomGPXAffiche"
    );

if (zoneNom) {

    zoneNom.textContent =
        nomBaseGPX;

}

console.log(
    "Nom restauré =",
    nomBaseGPX
);

if (releve.contenuGPX) {

    contenuGPX =
        releve.contenuGPX;

    chargerTexteGPX(
        contenuGPX
    );

}
        afficherWaypoints();



    console.log(
        "Sauvegarde restaurée"
    );

    alert(
        "Sauvegarde restaurée"
    );

}
// restaurerSauvegardeAutomatique();
document
    .getElementById("nomItineraire")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );

document
    .getElementById("dateCollecte")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );

document
    .getElementById("communeDepart")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );

document
    .getElementById("lieuDepart")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );

document
    .getElementById("collecteurs")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );

document
    .getElementById("acces")
    .addEventListener(
        "change",
        sauvegardeAutomatique
    );
    function afficherWaypoints() {

    groupeWaypoints.clearLayers();

    waypoints.forEach(function(wp) {

        let marqueur =
            L.marker(
                [
                    wp.latitude,
                    wp.longitude
                ]
            ).addTo(
                groupeWaypoints
            );
wp.marqueur = marqueur;

marqueur.numeroWP =
    wp.numero;
        marqueur.on(
            "click",
            function() {

                ouvrirWaypoint(wp);

            }
        );


    });

}
function viderFormulaire() {

    // tous les champs à vider
waypoints = [];

groupeWaypoints.clearLayers();

viderFormulaire();
}
function exporterTraceReelle() {

    console.log(
        "Points à exporter :",
        traceParcourue.length
    );

}
function exporterTraceReelle() {
console.log(
    "Points traceParcourue =",
    traceParcourue.length
);
    if (traceParcourue.length === 0) {

        alert(
            "Aucune trace à exporter"
        );

        return;

    }

    let gpx =

'<?xml version="1.0" encoding="UTF-8"?>\n' +
'<gpx version="1.1" creator="CDSI69">\n' +
'<trk>\n' +
'<name>Trace réelle</name>\n' +
'<trkseg>\n';

    traceParcourue.forEach(function(pt) {

        gpx +=

'<trkpt lat="' +
pt.latitude +
'" lon="' +
pt.longitude +
'"></trkpt>\n';

    });

gpx +=

'</trkseg>\n' +
'</trk>\n';

waypoints.forEach(function(wp) {

    gpx +=

'<wpt lat="' +
wp.latitude +
'" lon="' +
wp.longitude +
'">\n' +

'<name>WP' +
wp.numero +
'</name>\n' +

'</wpt>\n';

});

gpx +=

'</gpx>';


    let blob =
        new Blob(
            [gpx],
            {
                type:
                "application/gpx+xml"
            }
        );

    let lien =
        document.createElement("a");

    lien.href =
        URL.createObjectURL(blob);

    lien.download =
        "Trace_reelle.gpx";

    lien.click();

    alert(
        "Trace réelle exportée"
    );

}