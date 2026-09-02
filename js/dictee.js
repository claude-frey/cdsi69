
    /*CDSI69
    Version : 2.14 - août 2026
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
function dicterTexte(idChamp) {

    const champ = document.getElementById(idChamp);

    if (!champ) {
        return;
    }

    let bouton =
        document.getElementById("btnDictee" +
            idChamp.charAt(0).toUpperCase() +
            idChamp.slice(1));

    if (idChamp === "nouveauCommentairePhoto") {
        bouton =
            document.getElementById("btnDicteePhoto");
    }

    const lancerDictee = function(mode) {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {

            alert(
                "La reconnaissance vocale n'est pas disponible sur ce navigateur."
            );

            return;
        }

        const texteAvant = champ.value;

        const reconnaissance = new SpeechRecognition();

        reconnaissance.lang = "fr-FR";
        reconnaissance.interimResults = true;
        reconnaissance.continuous = false;

        // =====================================================
        // DÉBUT DE L'ÉCOUTE
        // =====================================================

        if (bouton) {

            bouton.textContent = "🎤 Écoute...";
            bouton.disabled = true;
        }

        // =====================================================
        // TEXTE RECONNU
        // =====================================================

        reconnaissance.onresult = function(event) {

            let texte = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                texte +=
                    event.results[i][0].transcript;
            }

            if (mode === "ajouter") {

                champ.value =
                    texteAvant.trim()
                        ? texteAvant.trim() + " " + texte.trim()
                        : texte.trim();

            } else {

                champ.value = texte.trim();
            }

            champ.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            champ.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );

        };

        // =====================================================
        // FIN DE L'ÉCOUTE
        // =====================================================

        reconnaissance.onend = function() {

            if (bouton) {

                bouton.textContent = "🎤 Dicter";
                bouton.disabled = false;
            }

        };

        // =====================================================
        // ERREUR
        // =====================================================

        reconnaissance.onerror = function(event) {

            console.log(
                "CDSI69 - Erreur reconnaissance vocale :",
                event.error
            );

            if (bouton) {

                bouton.textContent = "🎤 Dicter";
                bouton.disabled = false;
            }

        };

        reconnaissance.start();
    };


    // =====================================================
    // SI LE CHAMP EST VIDE : DICTÉE DIRECTE
    // =====================================================

    if (champ.value.trim() === "") {

        lancerDictee("remplacer");
        return;
    }


    // =====================================================
    // LE CHAMP CONTIENT DÉJÀ DU TEXTE
    // =====================================================

    const fond = document.createElement("div");

    fond.style.position = "fixed";
    fond.style.top = "0";
    fond.style.left = "0";
    fond.style.width = "100%";
    fond.style.height = "100%";
    fond.style.background = "rgba(0,0,0,0.45)";
    fond.style.zIndex = "5000";
    fond.style.display = "flex";
    fond.style.alignItems = "center";
    fond.style.justifyContent = "center";

    const boite = document.createElement("div");

    boite.style.background = "white";
    boite.style.padding = "20px";
    boite.style.borderRadius = "12px";
    boite.style.width = "85%";
    boite.style.maxWidth = "400px";
    boite.style.boxSizing = "border-box";
    boite.style.textAlign = "center";
    boite.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";

    const titre = document.createElement("h3");

    titre.textContent = "📝 Ce champ contient déjà du texte";

    titre.style.marginTop = "0";

    const message = document.createElement("p");

    message.textContent =
        "Que souhaitez-vous faire avec le nouveau texte dicté ?";

    const boutonAjouter = document.createElement("button");

    boutonAjouter.type = "button";
    boutonAjouter.textContent = "➕ Ajouter à la suite";

    const boutonRemplacer = document.createElement("button");

    boutonRemplacer.type = "button";
    boutonRemplacer.textContent = "🗑 Remplacer";

    const boutonAnnuler = document.createElement("button");

    boutonAnnuler.type = "button";
    boutonAnnuler.textContent = "❌ Annuler";


    [boutonAjouter, boutonRemplacer, boutonAnnuler].forEach(
        function(boutonDialogue) {

            boutonDialogue.style.width = "100%";
            boutonDialogue.style.padding = "12px";
            boutonDialogue.style.marginTop = "10px";
            boutonDialogue.style.boxSizing = "border-box";

        }
    );


    boutonAjouter.addEventListener(
        "click",
        function() {

            document.body.removeChild(fond);

            lancerDictee("ajouter");

        }
    );


    boutonRemplacer.addEventListener(
        "click",
        function() {

            document.body.removeChild(fond);

            lancerDictee("remplacer");

        }
    );


    boutonAnnuler.addEventListener(
        "click",
        function() {

            document.body.removeChild(fond);

        }
    );


    boite.appendChild(titre);
    boite.appendChild(message);
    boite.appendChild(boutonAjouter);
    boite.appendChild(boutonRemplacer);
    boite.appendChild(boutonAnnuler);

    fond.appendChild(boite);

    document.body.appendChild(fond);

}
document
    .getElementById("btnDicteePoiPov")
    .addEventListener(
        "click",
        function() {

            dicterTexte("poiPov");

        }

        
    );

document
    .getElementById("btnDicteeObsNuisance")
    .addEventListener(
        "click",
        function() {

            dicterTexte("obsNuisance");

        }
    );

document
.getElementById("btnDicteeAutreSignaletique")
.addEventListener(
"click",
function() {

    dicterTexte("signaletiqueAutre");

}
);


document
.getElementById("btnDicteeAutreSecurite")
.addEventListener(
"click",
function() {

    dicterTexte("securiteAutre");

}
);


document
.getElementById("btnDicteeAutreNuisance")
.addEventListener(
"click",
function() {

    dicterTexte("autreNuisance");

}
);

document
    .getElementById("btnDicteePasAPas")
    .addEventListener(
        "click",
        function() {

            dicterTexte("pasAPas");

        }
    ); 

document
    .getElementById("btnDicteeNomTrace")
    .addEventListener(
        "click",
        function() {

            dicterTexte("nomTrace");

        }
    );  
    
    document
    .getElementById("btnDicteeCommuneDepart")
    .addEventListener(
        "click",
        function() {

            dicterTexte("communeDepart");

        }
    );

    document
    .getElementById("btnDicteeLieuDepart")
    .addEventListener(
        "click",
        function() {

            dicterTexte("lieuDepart");

        }
    );

    document
    .getElementById("btnDicteeAccesDepart")
    .addEventListener(
        "click",
        function() {

            dicterTexte("accesDepart");

        }
    );

  // =====================================================
    // 20-08--06h39
    // =====================================================

    document
    .getElementById("btnDicteePhoto")
    .addEventListener(
        "click",
        function() {

            dicterTexte("nouveauCommentairePhoto");

        }
    );