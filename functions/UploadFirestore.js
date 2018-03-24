'use strict';
const Firestore = require('@google-cloud/firestore');
const getVideoInfo = require('get-video-info');
const analyseVideo = require('./AnalyseVideo');
const firestore = new Firestore({
    projectId: 'videoupload-12236',
    keyFilename: 'service-account.json'
});
const admin = require('firebase-admin');
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});
var db = admin.firestore();
process.env.GCLOUD_PROJECT = 'videoupload-12236';

const uploadFirestore = (files, url) => {
    let prom = new Promise((resolve, reject) => {
        if (!files) {
            reject("Error!");
        }

        var filepath = files.file.path;
        getVideoInfo(filepath).then(info => {
            const document = firestore.doc('video/'+files.file.name);
            // Enter metadata into the document.
          /*   console.log(info.format.duration);
          console.log(info.streams[0].width);
          console.log(info.streams[0].height);
          console.log(info.streams[0].display_aspect_ratio);*/
            document.set({
                height: info.streams[0].height,
                width: info.streams[0].width,
                duration: info.format.duration,
                AspectRatio: info.streams[0].display_aspect_ratio,
                storageURL: url

            });
            setTimeout(function(){
                var docRef = db.collection("video").doc(files.file.name);
                console.log(files.file.name);
                docRef.get().then(function(doc) {
                    if (doc.exists) {
                        var gcsUri =doc.data().storageURL;
                        console.log(gcsUri);
                        //Analyse Video using Google Video intelligence API
                        analyseVideo(gcsUri).then((Videoresult) => {
                            var setWithOptions = docRef.set({
                                Pornographyliklihood: Videoresult
                            }, { merge: true });

                            return setWithOptions.then(res => {
                                console.log('Update: ', res);
                            });
                        });
                    } else {
                        console.log("No such document!");
                    }
                }).catch(function(error) {
                    console.log("Error getting document:", error);
                });
            },10000);
        });





        resolve("success");
    });
    return prom;
};

module.exports = uploadFirestore;