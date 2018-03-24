'USe strict';
const Busboy = require('busboy');

const googleStorage = require('@google-cloud/storage');
const projectId = 'videoupload-12236';
const storage = googleStorage ({
    projectId: projectId,
    keyFilename: 'service-account.json'
});

var Globals;
let newFileName;
const bucketName = storage.bucket(projectId + '.appspot.com');
const uploadFirebase = (req) => {

    let prom = new Promise((resolve, reject) => {
        if (!req) {
            reject("Error!");
        }
        var busboy = new Busboy({headers: req.headers});
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            newFileName = `${filename}_${Date.now()}`;
            let fileUpload = bucketName.file(newFileName);
            const publicUrl = `https://storage.googleapis.com/${bucketName.name}/${fileUpload.name}`;
            Globals = {
                'gcsUri': "gs://"+bucketName.name+"/"+fileUpload.name
        };
            module.exports = Globals;
            file.pipe(fileUpload.createWriteStream(publicUrl));
            resolve("Success");
        });
        busboy.on('finish', function () {
            console.log('Upload to Firebase complete');
        });
        return req.pipe(busboy);
    });
    return prom;

};
module.exports = uploadFirebase;