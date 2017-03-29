var urlm = require('url');


function addPagenoToUrl(url, pageno, _param_name) {
    var param_name = _param_name ? _param_name : "pageno";
    var urlObj = urlm.parse(url, true);

    urlObj.query[param_name] = pageno;

    delete urlObj.search;

    return urlm.format(urlObj);
}


// Funcion de ayuda para paginar.
// Devuelve un fragmento HTML con los enlaces para paginar.
// 
exports.paginate = function (totalItems, itemsPerPage, currentPage, url, param_name) {

    if (totalItems <= itemsPerPage) {
        return false;
    }

    var total = Math.ceil(totalItems / itemsPerPage);

    // Numero de enlaces a mostrar antes y despues de la pagina actual.
    // Ademas de estos, tambien se muestran los enlaces primero y ultimo, y entre medias.
    var neighbours = 2; // items a mostrar alrededor el la pagina actuañ

    var html = [];

    html.push('<ul class="pagination">');

    // reajustar neighbours para evitar botoneras pequeñas:
    //  - Si no caben vecinos por la izquierda, muestro mas por la derecha.
    //  - Si no caben vecinos por la derecha, muestro mas por la izquierda.
    if (currentPage - neighbours <= 2) {
        neighbours += 3 + neighbours - currentPage;
    } else if (total - currentPage - neighbours <= 1) {
        neighbours += 2 - total + currentPage + neighbours;
    }

    // Primera pagina
    if (1 < currentPage - neighbours) {
        url = addPagenoToUrl(url, 1, param_name);
        html.push('<li> <a href="' + url + '">' + 1 + '</a></li>');
    }

    // Anterior: entre primera y centrales
    if (currentPage - neighbours > 2) {
        var n = Math.trunc(( 1 + currentPage - neighbours) / 2);
        url = addPagenoToUrl(url, n, param_name);
        html.push('<li> <a href="' + url + '">' + n + '</a></li>');
    }

    // Paginas centrales
    for (var i = 1; i <= total; i++) {
        if (i === currentPage) {
            html.push('<li class="active"> <a href="#">' + i + '</a></li>');
        } else {
            if (i >= currentPage - neighbours && i <= currentPage + neighbours) {
                url = addPagenoToUrl(url, i, param_name);
                html.push('<li> <a href="' + url + '">' + i + '</a></li>');
            }
        }
    }

    // Siguientes: entre centrales y el final
    if (currentPage + neighbours < total - 1) {
        var n = Math.trunc(( total + currentPage + neighbours + 1) / 2);
        url = addPagenoToUrl(url, n, param_name);
        html.push('<li> <a href="' + url + '">' + n + '</a></li>');
    }

    // Ultima pagina
    if (total > currentPage + neighbours) {
        url = addPagenoToUrl(url, total, param_name);
        html.push('<li> <a href="' + url + '">' + total + '</a></li>');
    }

    html.push('</ul>');

    return html.join('');
};