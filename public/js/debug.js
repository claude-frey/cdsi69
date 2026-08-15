// ====================================================
// Outils de diagnostic CDSI69
// ====================================================

//const MODE_DEBUG = true;
const MODE_DEBUG = false;
function debugTel(titre, message) {

    if (!MODE_DEBUG) return;

    alert(
        titre +
        "\n\n" +
        message
    );

}