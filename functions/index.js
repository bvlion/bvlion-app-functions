const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const Slack = require('slack')
const slack = new Slack()

exports.test = functions.https.onRequest((request, response) => {
  response.status(200).send(request.body.challenge)
})

exports.hello = functions.https.onRequest((req, res) => {
  const payload = req.body
  console.log(payload.event)
  admin.database().ref('/function')
    .on("value", (snapshot) => {
        const element = snapshot.val()
        console.log(element)
        slack.chat.postMessage({
          token: element.token,
          channel: payload.event.channel,
          text: element.answer,
          attachments: [{
              callback_id: 'deploy_button',
              text: '',
             actions: element.actions.map(v => ({
                  type: 'button',
                  text: v,
                  name: v
              }))
          }]
      }).then(console.log).catch(console.error)
    }, (errorObject) => {
      res.status(404).send({ message: 'Not Found' })
    })
})
