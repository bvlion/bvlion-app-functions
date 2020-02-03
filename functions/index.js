const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.hello = functions.https.onRequest((request, response) => {
  admin.database().ref('/test')
    .on("value", (snapshot) => {
      response.status(200).send(snapshot.val())
    }, (errorObject) => {
      response.status(404).send({ message: 'Not Found' })
    })
});
