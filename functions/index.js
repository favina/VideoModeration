"use strict";
const express = require('express');
const app = express();
const path  = require("path"),
    formidable = require('formidable');

const uploadFirebase = require('./UploadFirebase');
const uploadFirestore = require('./UploadFirestore');

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../public/index.html'));
});

app.post('/', function(req, res) {

    let form = new formidable.IncomingForm();
    //Upload video to Firebase using busboy
    uploadFirebase(req).then((Success) => {
    console.log(Success);
    });

    //get video metatdata
    form.parse(req, function (err, fields, files) {
        var globals = require('./UploadFirebase');
        var url = globals.gcsUri;
        uploadFirestore(files, url).then((success) => {
            console.log("Upload to Firestore complete");
            res.status(200).send({
                status: 'success'
            });
        }).catch((error) => {
            console.error(error);
        });
    });
});



app.listen(3000,function(){
    console.log("App Started on PORT 3000");
});

