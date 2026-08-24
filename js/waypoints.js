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


//-------------------------------------------------
// MODE CREATION D'UN POINT DE RELEVÉ
//-------------------------------------------------
let groupeWaypoints = null;

let waypoints = [];

let waypointCourant = null;

let indexWaypointCourant = -1;

let numeroWP = 1;

let indexPhoto = 0;




function nouveauPointDeReleve() {

    if (latitudeGPS == null || longitudeGPS == null) {

        alert(
            "En attente d'une position GPS précise..."
        );

        return;

    }

   

    ajouterWaypoint(
        latitudeGPS,
        longitudeGPS
    );

}
//-------------------------------------------------
// Fonction utilitaire
//-------------------------------------------------

function remplirChamp(id, valeur) {

    const champ = document.getElementById(id);

    if (!champ) return;

    if (
        champ.tagName === "INPUT" ||
        champ.tagName === "TEXTAREA" ||
        champ.tagName === "SELECT"
    ) {
        champ.value = valeur;
    } else {
        champ.textContent = valeur;
    }
}


//-------------------------------------------------
// Création d'un waypoint
//-------------------------------------------------
 
function ajouterWaypoint(latitude, longitude) {

    indexWaypointCourant = -1;

    const latlng = L.latLng(latitude, longitude);
    const modeSansGPX = (pointsTrace.length === 0);

    let distanceMin = Infinity;

    pointsTrace.forEach(function(point) {

        let distance =
            latlng.distanceTo(point);

        if (distance < distanceMin) {
            distanceMin = distance;
        }

    });

    let segmentInfo = {
    segment: -1,
    distance: 0
};

let pkCalcule = Math.round(getDistanceCollecte());
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

    let entrePasCalcule = 0;

    if (waypoints.length > 0) {

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

const champPK = document.getElementById("pk");
if (champPK) {
    champPK.value = Math.round(pkCalcule);
}

const champEntrePas = document.getElementById("entrePas");
if (champEntrePas) {
    champEntrePas.value = entrePasCalcule;
}






  
    waypointCourant = {
	
    numero: numeroWP,

    latitude: latitude,
    longitude: longitude,
    
    ecartGPX:
    Math.round(
        segmentInfo.distance
    ),

    balisage:
    waypoints.length > 0
        ? waypoints[waypoints.length - 1].balisage
        : "",
        balisageAutre: "", 
    agglo:
    waypoints.length > 0
        ? waypoints[waypoints.length - 1].agglo
        : "H",
    cheminement:
    waypoints.length > 0
        ? waypoints[waypoints.length - 1].cheminement
        : "R",
    signaletique: "",
    signaletiqueAutre: "",
    pk: Math.round(pkCalcule),
    entrePas: entrePasCalcule,
    securite: "",
    securiteAutre: "",
    nuisances: "",
    autreNuisance: "",
    poiPov: "",
    pasAPas: "",
    photos: [],
	marqueur: null,
    obsNuisance: "",

	
};

  let iconeWP = L.divIcon({

    className: "iconeWP",

    html: numeroWP,

    iconSize: [26, 26],

    iconAnchor: [13, 13]

});

let marqueur = L.marker(
    [latitude, longitude],
    { icon: iconeWP }
).addTo(groupeWaypoints);

waypointCourant.marqueur = marqueur;

marqueur.numeroWP = numeroWP;

marqueur.on("click", function() {

  

    let wp = waypoints.find(
        w => w.numero === marqueur.numeroWP
    );

    if (wp) {

       
        ouvrirWaypoint(wp);

    } else {

      
    }

});
remplirChamp("numeroWP", numeroWP);

remplirChamp("ecartGPX", waypointCourant.ecartGPX);
choisirBalisage(waypointCourant.balisage);
choisirAgglo(waypointCourant.agglo);
choisirCheminement(waypointCourant.cheminement);
choisirSignaletique("");
document.getElementById("signaletiqueAutre").value = "";
remplirChamp("pk", Math.round(pkCalcule));
remplirChamp("entrePas", entrePasCalcule);
choisirSecurite("");
document.getElementById("securiteAutre").value = "";
remplirChamp("nuisances", "");
document.getElementById("autreNuisance").value = "";
remplirChamp("obsNuisance", "");
remplirChamp("poiPov", "");
remplirChamp("pasAPas", "");


document.getElementById("overlay").style.display = "block";
document.getElementById("ficheWP").style.display = "block";
document.getElementById("ficheWP").scrollTop = 0;
window.scrollTo(0, 0);



// session.numeroWP = numeroWP;

// afficherSession();

}

document
    .getElementById("btnEnregistrer")
    .addEventListener("click", enregistrerWaypoint);

document
    .getElementById("btnSupprimer")
    .addEventListener("click", supprimerWaypoint);  
    
document
    .getElementById("btnAnnuler")
    .addEventListener("click", annulerWaypoint);
document
    .getElementById("overlay")
    .addEventListener("click", annulerWaypoint);
document
    .getElementById("btnPhoto")
    .addEventListener("click", gererPhotoWaypoint);
document
    .getElementById("photoWaypoint")
    .addEventListener("change", ajouterPhotosWaypoint);    
document
    .getElementById("btnFermerMenuPhotos")
    .addEventListener("click", function () {

        document
            .getElementById("menuPhotos")
            .classList
            .remove("visible");
             });
document
    .getElementById("btnAjouterPhoto")
    .addEventListener("click", ajouterPhotoDepuisMenu);
document
    .getElementById("btnVoirPhotos")
    .addEventListener("click", voirPhotosWaypoint);
document
    .getElementById("btnFermerVisionneuse")
    .addEventListener("click", function () {

        

        document
            .getElementById("visionneusePhotos")
            .classList
            .remove("visible");

    });
document
    .getElementById("btnPhotoSuivante")
    .addEventListener("click", photoSuivante);
document
    .getElementById("btnPhotoPrecedente")
    .addEventListener("click", photoPrecedente);

document
    .getElementById("btnValiderCommentairePhoto")
    .addEventListener(
        "click",
        validerCommentairePhoto
    );

document
    .getElementById("btnAnnulerCommentairePhoto")
    .addEventListener(
        "click",
        fermerDialogueCommentairePhoto
    );

function prochainIdPhoto() {

    if (waypointCourant.photos.length === 0) {
        return 1;
    }

    return Math.max(
        ...waypointCourant.photos.map(photo => photo.id)
    ) + 1;

}


function ajouterPhotosWaypoint(event) {

    const fichiers = event.target.files;

    for (const fichier of fichiers) {

  let numeroPhoto = 1;

if (waypointCourant.photos.length > 0) {

    numeroPhoto =
        Math.max(
            ...waypointCourant.photos.map(function(photo) {

                return photo.id;

            })
        ) + 1;

}

        const reference =
            "WP" +
            String(waypointCourant.numero).padStart(3, "0") +
            "-P" +
            String(numeroPhoto).padStart(2, "0");


        // =============================================
        // Création de la photo dans le WP
        // =============================================

        waypointCourant.photos.push({

            id: numeroPhoto,

            idBDD: reference,

            reference: reference,

            nom: fichier.name,

            type: fichier.type,

            taille: fichier.size,

            date: new Date().toISOString(),

            commentaire: "",
               fichier: fichier

        });


        // =============================================
        // Récupération de la photo qui vient d'être créée
        // =============================================

        const photo =
            waypointCourant.photos[
                waypointCourant.photos.length - 1
            ];


        // =============================================
        // Sauvegarde dans IndexedDB
        // =============================================

        enregistrerPhotoDansBDD({

            id: photo.idBDD,

           /*  idBDD: photo.idBDD, */

            reference: photo.reference,

            nom: photo.nom,

            type: photo.type,

            taille: photo.taille,

            date: photo.date,

            commentaire: photo.commentaire,

            fichier: photo.fichier
         })

        .then(function() {

            console.log(
                "CDSI69 : photo enregistrée dans IndexedDB : " +
                photo.reference
            );

        })

        .catch(function(erreur) {

            alert(
                "Impossible d'enregistrer la photo : " +
                erreur
            );

        });


        // =============================================
        // Ouverture du commentaire
        // =============================================

        ouvrirDialogueCommentairePhoto(photo);

    }


    document.getElementById("btnPhoto").textContent =
        "📷 Photos (" +
        waypointCourant.photos.length +
        ")";

    event.target.value = ""; 
}   


function gererPhotoWaypoint() {

    alert("Bouton photo bien reçu");

    if (
        !waypointCourant ||
        !waypointCourant.photos ||
        waypointCourant.photos.length === 0
    ) {

        alert("Ouverture de la caméra");

        document
            .getElementById("photoWaypoint")
            .click();

        return;

    }

    alert("Affichage du menu des photos");

    document
        .getElementById("menuPhotos")
        .classList
        .add("visible");
}


function ajouterPhotoDepuisMenu() {

    document
        .getElementById("menuPhotos")
        .classList
        .remove("visible");

    document
        .getElementById("photoWaypoint")
        .click();

}

function voirPhotosWaypoint() {

    document
        .getElementById("menuPhotos")
        .classList
        .remove("visible");

    indexPhoto = 0;

    afficherPhotoCourante();

    document
        .getElementById("visionneusePhotos")
        .classList
        .add("visible");

}

function afficherPhotoCourante() {

    const photo =
        waypointCourant.photos[indexPhoto];

   

    // =============================================
    // Photo encore disponible directement
    // =============================================

    if (photo.fichier instanceof Blob) {

    afficherFichierPhoto(photo);

    return;
}


    // =============================================
    // Photo récupérée depuis IndexedDB
    // =============================================

    recupererPhotoDepuisBDD(photo.idBDD)

        .then(function(photoBDD) {

            if (!photoBDD || !photoBDD.fichier) {

                alert(
                    "❌ La photo " +
                    photo.reference +
                    " est introuvable."
                );

                return;
            }
            
            // On remet le fichier dans l'objet photo
            photo.fichier = photoBDD.fichier;

            afficherFichierPhoto(photo);

        })

        .catch(function(erreur) {

            alert(
                "❌ Impossible de récupérer la photo : " +
                erreur
            );

        });

}

function afficherFichierPhoto(photo) {

    document
        .getElementById("imagePhoto")
        .src =
            URL.createObjectURL(photo.fichier);


    document
        .getElementById("referencePhoto")
        .textContent =
            photo.reference;


    document
        .getElementById("commentairePhoto")
        .value =
            photo.commentaire;


    document
        .getElementById("compteurPhotos")
        .textContent =
            (indexPhoto + 1) +
            " / " +
            waypointCourant.photos.length;

}


function sauvegarderCommentairePhoto() {

    if (
        !waypointCourant ||
        !waypointCourant.photos ||
        waypointCourant.photos.length === 0
    ) {
        return;
    }

    waypointCourant.photos[indexPhoto].commentaire =
        document.getElementById("commentairePhoto").value;

}

function enregistrerCommentairePhoto() {

    sauvegarderCommentairePhoto();

    const message = document.getElementById("messageCommentaire");

    message.classList.remove("messageCache");
    message.classList.add("messageVisible");

    setTimeout(function () {

        message.classList.remove("messageVisible");
        message.classList.add("messageCache");

    }, 1200);

}

function ouvrirDialogueCommentairePhoto(photo) {

    photoEnCours = photo;

    referencePhotoEnCours = photo.reference;

    document.getElementById("referenceNouvellePhoto").textContent =
        photo.reference;

    document.getElementById("nouveauCommentairePhoto").value =
        photo.commentaire;

    document
        .getElementById("dialogCommentairePhoto")
        .classList
        .add("visible");

    document
        .getElementById("nouveauCommentairePhoto")
        .focus();

}

function validerCommentairePhoto() {

    if (!photoEnCours) {
        return;
    }

    photoEnCours.commentaire =
        document.getElementById("nouveauCommentairePhoto").value;

    fermerDialogueCommentairePhoto();
    photoEnCours = null;
referencePhotoEnCours = "";

}

function fermerDialogueCommentairePhoto() {

    document
        .getElementById("dialogCommentairePhoto")
        .classList
        .remove("visible");

}

function photoSuivante() {

    if (indexPhoto < waypointCourant.photos.length - 1) {

        sauvegarderCommentairePhoto();

        indexPhoto++;

        afficherPhotoCourante();

    }

}

function photoPrecedente() {

    if (indexPhoto > 0) {

        sauvegarderCommentairePhoto();

        indexPhoto--;

        afficherPhotoCourante();

    }

}

function supprimerPhotoCourante() {

    if (waypointCourant.photos.length === 0) {
        return;
    }

    const photoSupprimee =
        waypointCourant.photos[indexPhoto];

    const idBDD =
        photoSupprimee.idBDD;


    // =============================================
    // Suppression dans IndexedDB
    // =============================================

    if (idBDD) {

        supprimerPhotoDepuisBDD(idBDD)

        .catch(function(erreur) {

            console.error(
                "Erreur suppression photo IndexedDB : ",
                erreur
            );

        });

    }


    // =============================================
    // Suppression dans le WP
    // =============================================
 waypointCourant.photos.splice(indexPhoto, 1);


    // =============================================
    // Plus aucune photo
    // =============================================

    if (waypointCourant.photos.length === 0) {

        document
            .getElementById("visionneusePhotos")
            .classList
            .remove("visible");

        document
            .getElementById("btnPhoto")
            .textContent =
                "📷 Ajouter une photo";

        return;

    }


    // =============================================
    // Ajustement de l'index
    // =============================================

    if (
        indexPhoto >=
        waypointCourant.photos.length
    ) {

        indexPhoto =
            waypointCourant.photos.length - 1;
    }


    afficherPhotoCourante();


    document
        .getElementById("btnPhoto")
        .textContent =
            "📷 Photos (" +
            waypointCourant.photos.length +
            ")";

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

         indexWaypointCourant = waypoints.indexOf(wp);

    ;
    
    remplirChamp("ecartGPX", wp.ecartGPX);

    if (modeGPX.checked) {
    document.getElementById("infoGPX").style.display = "";
} else {
    document.getElementById("infoGPX").style.display = "none";
}


    document.getElementById("numeroWP").textContent =
        wp.numero;



    choisirBalisage(wp.balisage);

    document.getElementById("balisageAutre").value =
    wp.balisageAutre || "";

    choisirAgglo(wp.agglo);

    choisirCheminement(wp.cheminement);



    choisirSignaletique(wp.signaletique);

    document.getElementById("signaletiqueAutre").value =
wp.signaletiqueAutre || "";


  document.getElementById("pk").textContent =
    wp.pk;

document.getElementById("entrePas").textContent =
    wp.entrePas;   

    choisirSecurite(wp.securite);

    document.getElementById("securiteAutre").value =
wp.securiteAutre || "";

    document.getElementById("nuisances").value =
    wp.nuisances;

    gererNuisance();

    document.getElementById("autreNuisance").value =
    wp.autreNuisance || "";

    document.getElementById("obsNuisance").value =
    wp.obsNuisance;

    document.getElementById("poiPov").value =
    wp.poiPov;

    document.getElementById("pasAPas").value =
    wp.pasAPas;    
  
    const nbPhotos = wp.photos ? wp.photos.length : 0;

    document.getElementById("btnPhoto").textContent =
        nbPhotos > 0
            ? `📷 Photos (${nbPhotos})`
            : "📷 Photos";

document.getElementById("overlay").style.display = "block";
document.getElementById("ficheWP").style.display = "block";
}

function enregistrerWaypoint() {
    

    if (!waypointCourant) return;

    waypointCourant.balisage =
        document.getElementById("balisage").value;

    waypointCourant.balisageAutre =
        document.getElementById("balisageAutre").value;

    waypointCourant.agglo =
        document.getElementById("agglo").value;

    waypointCourant.cheminement =
        document.getElementById("cheminement").value;

waypointCourant.signaletique =
    document.getElementById("signaletique").value;




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

waypointCourant.autreNuisance =
document.getElementById("autreNuisance").value;

waypointCourant.signaletiqueAutre =
document.getElementById("signaletiqueAutre").value;

waypointCourant.securiteAutre =
document.getElementById("securiteAutre").value;

waypointCourant.obsNuisance =
    document.getElementById("obsNuisance").value;

waypointCourant.poiPov =
    document.getElementById("poiPov").value;

waypointCourant.pasAPas =
    document.getElementById("pasAPas").value;

    
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

if (indexWaypointCourant === -1) {

    waypoints.push(waypointCourant);

  

    const nbWP = document.getElementById("nbWaypoints");

    if (nbWP) {
        nbWP.textContent = waypoints.length;
    }

    numeroWP++;

} else {

    waypoints[indexWaypointCourant] = waypointCourant;

}



waypoints.sort(
    (a, b) => Number(a.pk) - Number(b.pk)
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


groupeWaypoints.getLayers().forEach(
    m => console.log(m.numeroWP)
);



indexWaypointCourant = -1;



document.getElementById("ficheWP").style.display = "none";

document.getElementById("overlay").style.display = "none";


collecteModifieeDepuisDerniereSauvegarde();
sauvegarderCollecte();
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

function supprimerWaypoint() {

    
const confirmer = confirm(
    "Attention !\n\n" +
    "Vous allez supprimer ce waypoint ainsi que " +
    "toutes les données qui lui sont associées, " +
    "(y compris les éventuelles photos).\n\n" +
    "Cette opération est définitive et irréversible.\n\n" +
    "Voulez-vous vraiment supprimer ce WP ?"
);

if (!confirmer) {
    return;
}
    

    if (!waypointCourant) return;



if (waypointCourant.marqueur) {

    const marqueurSupprime = L.marker(
        [
            waypointCourant.latitude,
            waypointCourant.longitude
        ],
        {
            icon: L.divIcon({
                className: "iconeWP",
   
                html:
    "<div style='position:relative; width:26px; height:26px;'>" +
        "<span style='position:absolute; left:0; top:0; width:26px; height:26px; line-height:26px; text-align:center; font-size:16px;'>" +
            waypointCourant.numero +
        "</span>" +
        "<span style='position:absolute; left:0; top:0; width:26px; height:26px; line-height:26px; text-align:center; font-size:24px; font-weight:bold;'>" +
            "✕" +
        "</span>" +
    "</div>",


                iconSize: [26, 26],
                iconAnchor: [13, 13]
            })
        }
    ).addTo(groupeWaypoints);

    waypointCourant.marqueur.remove();

    marqueurSupprime.numeroWP =
        waypointCourant.numero;
        waypointCourant.marqueur = marqueurSupprime;

}

   let index = waypoints.indexOf(
    waypointCourant
);


    if (index !== -1) {

         if (waypointCourant.photos) {

        waypointCourant.photos.forEach(function(photo) {

            supprimerPhotoDepuisBDD(photo.idBDD);

        });

    }

      waypointCourant.supprime = true;

    
 



        waypoints.sort(
            (a, b) => Number(a.pk) - Number(b.pk)
        );


groupeWaypoints.getLayers().forEach(
    m => console.log(m.numeroWP)
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

    

    document.getElementById("ficheWP").style.display = "none";
    document.getElementById("overlay").style.display = "none";

}

function annulerWaypoint() {

    if (!waypointCourant) {
        return;
    }

    // Si c'est un nouveau waypoint,
    // on enlève son marqueur
    if (indexWaypointCourant === -1) {

        if (waypointCourant.marqueur) {

            groupeWaypoints.removeLayer(
                waypointCourant.marqueur
            );

        }

    }

    waypointCourant = null;
    indexWaypointCourant = -1;

    document.getElementById("ficheWP").style.display =
        "none";

    document.getElementById("overlay").style.display =
        "none";
function selectionnerBouton(bouton) {

    const groupe = bouton.dataset.groupe;
    const valeur = bouton.dataset.valeur;

    

}
}

function restaurerWaypoint(wp) {

    let htmlMarqueur;
    let clicActif = true;

    if (wp.supprime) {

        htmlMarqueur =
            "<div style='position:relative; width:26px; height:26px;'>" +
                "<span style='position:absolute; left:0; top:0; width:26px; height:26px; line-height:26px; text-align:center; font-size:16px;'>" +
                    wp.numero +
                "</span>" +
                "<span style='position:absolute; left:0; top:0; width:26px; height:26px; line-height:26px; text-align:center; font-size:24px; font-weight:bold;'>" +
                    "✕" +
                "</span>" +
            "</div>";

        clicActif = false;

    } else {

        htmlMarqueur = wp.numero;

    }

    let iconeWP = L.divIcon({
        className: "iconeWP",
        html: htmlMarqueur,
        iconSize: [26,26],
        iconAnchor: [13,13]
    });

    let marqueur = L.marker(
        [wp.latitude, wp.longitude],
              {icon: iconeWP}
    ).addTo(groupeWaypoints);

    marqueur.numeroWP = wp.numero;

    wp.marqueur = marqueur;

    if (clicActif) {

        marqueur.on("click", function () {

            ouvrirWaypoint(wp);

        });

    }

    waypoints.push(wp);

}