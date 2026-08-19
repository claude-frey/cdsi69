

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

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "La reconnaissance vocale n'est pas disponible sur ce navigateur."
        );

        return;
    }

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

    champ.value = texte;

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

    document
    .getElementById("btnDicteePhoto")
    .addEventListener(
        "click",
        function() {

            dicterTexte("nouveauCommentairePhoto");

        }
    );
  // FIN CORRECTE//