var cloudinary = require('cloudinary');
var fs = require('fs');

/**
 * Crea una promesa para subir un fichero nuevo a Cloudinary.
 *
 * Si puede subir el fichero la promesa se satisface y devuelve el public_id y
 * la url del recurso subido.
 * Si no puede subir el fichero, la promesa se rechaza.
 *
 * @return Devuelve una Promesa.
 */
exports.uploadResourceToCloudinary = function (path, options) {

    return new Promise(function (resolve, reject) {

        cloudinary.v2.uploader.upload(
            path,
            options,
            function (error, result) {
                if (!error) {
                    resolve({public_id: result.public_id, url: result.secure_url});
                } else {
                    reject(error);
                }
            }
        );
    })
};
