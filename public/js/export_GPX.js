function exporterGPX(collecte) {

    if (!collecte) {
        alert("Aucune collecte à exporter.");
        return;
    }

    let gpx = "";

    gpx += '<?xml version="1.0" encoding="UTF-8"?>\n';

    gpx += '<gpx version="1.1" ';
    gpx += 'creator="CDSI69" ';
    gpx += 'xmlns="http://www.topografix.com/GPX/1/1" ';
    gpx += 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
    gpx += 'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 ';
    gpx += 'http://www.topografix.com/GPX/1/1/gpx.xsd">\n';

    gpx += '<trk>\n';

    gpx += '<name>' +
        collecte.nomCollecte +
        '</name>\n';

    gpx += '<trkseg>\n';


    // =============================================
    // Trace réellement parcourue
    // =============================================

    const trace =
        collecte.traceParcourue || [];

    for (let i = 0; i < trace.length; i++) {

        const point = trace[i];
           if (
            point.latitude == null ||
            point.longitude == null
        ) {
            continue;
        }

        gpx += '<trkpt ' +
            'lat="' + point.latitude + '" ' +
            'lon="' + point.longitude + '">';

        if (point.altitude != null) {

            gpx += '<ele>' +
                point.altitude +
                '</ele>';

        }

        gpx += '</trkpt>\n';
    }


    gpx += '</trkseg>\n';
    gpx += '</trk>\n';


    // =============================================
    // Waypoints CDSI69
    // =============================================

    const waypoints =
        collecte.waypoints || [];

    for (let i = 0; i < waypoints.length; i++) {

    const wp = waypoints[i];

    if (
        wp.latitude == null ||
        wp.longitude == null
    ) {
        continue;
    }

gpx += '<wpt ' +
    'lat="' + wp.latitude + '" ' +
    'lon="' + wp.longitude + '">\n';

gpx += '<name>WP' +
    String(wp.numero).padStart(3, "0") +
    '</name>\n';

// Protection des caractères spéciaux XML
function echapperXML(valeur) {

    return String(valeur ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

}

gpx += '<desc>' +

    'Balisage : ' +
    echapperXML(wp.balisage) +

    '\n' +

    'Agglo : ' +
    echapperXML(wp.agglo) +

    '\n' +

    'Cheminement : ' +
    echapperXML(wp.cheminement) +

    '\n' +

    'Signalétique : ' +
    echapperXML(wp.signaletique) +
     '\n' +

    'Sécurité : ' +
    echapperXML(wp.securite) +

    '\n' +

    'Nuisances : ' +
    echapperXML(wp.nuisances) +

    '\n' +

    'Observation : ' +
    echapperXML(wp.obsNuisance) +

    '\n' +

    'Photos : ' +
    (wp.photos ? wp.photos.length : 0) +

    '\n' +

    'POI / POV : ' +
    echapperXML(wp.poiPov) +

    '\n' +

    'Pas à pas : ' +
    echapperXML(wp.pasAPas) +

    '\n' +

    'PK : ' +
    echapperXML(wp.pk) +

    '\n' +

    'Entre pas : ' +
    echapperXML(wp.entrePas) +

     '</desc>\n';


gpx += '</wpt>\n';

}


    gpx += '</gpx>\n';

    
    // =============================================
    // Création du fichier GPX
    // =============================================

    const blob = new Blob(
        [gpx],
        {
            type: "application/gpx+xml"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const lien =
        document.createElement("a");

    lien.href = url;

    lien.download =
        collecte.nomCollecte +
        "_enrichi.gpx";

    document.body.appendChild(lien);

    lien.click();

    document.body.removeChild(lien);

    URL.revokeObjectURL(url);
}