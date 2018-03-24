const video = require('@google-cloud/video-intelligence').v1;
const client = new video.VideoIntelligenceServiceClient(
    {
        projectId: 'videoupload-12236',
        keyFilename: 'service-account.json'
    });
const likelihoods = [
    'UNKNOWN',
    'VERY_UNLIKELY',
    'UNLIKELY',
    'POSSIBLE',
    'LIKELY',
    'VERY_LIKELY',
];
let Videoresult;
const analyseVideo = (gcsUri) => {
    let prom = new Promise((resolve, reject) => {

        const request = {
            inputUri: gcsUri,
            features: ['EXPLICIT_CONTENT_DETECTION'],
        };
        client
            .annotateVideo(request)
            .then(results => {
                const operation = results[0];
                console.log('Waiting for Google Video Intelligence API to complete...');
                return operation.promise();
            })
            .then(results => {
                // Gets unsafe content
                    const explicitContentResults = results[0].annotationResults[0].explicitAnnotation;
                    explicitContentResults.frames.forEach(result => {
                        if (result.timeOffset === undefined) {
                            result.timeOffset = {};
                        }
                        if (result.timeOffset.seconds === undefined) {
                            result.timeOffset.seconds = 0;
                        }
                        if (result.timeOffset.nanos === undefined) {
                            result.timeOffset.nanos = 0;
                        }
                        //console.log(`\tTime: ${result.timeOffset.seconds}` + `.${(result.timeOffset.nanos / 1e6).toFixed(0)}s`);
                         //console.log(`\t\tPornography liklihood: ${likelihoods[result.pornographyLikelihood]}`);
                        Videoresult=`${likelihoods[result.pornographyLikelihood]}`;

                });
                resolve(Videoresult);
            }).catch(err => {
            console.error('ERROR:', err);
        });
    });
    return prom;
};

module.exports = analyseVideo;

