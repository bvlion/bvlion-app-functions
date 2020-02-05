const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const Slack = require('slack')
const slack = new Slack()
const request = require('request')

exports.test = functions.https.onRequest((request, response) => {
  response.status(200).send(request.body)
})

exports.hello = functions.https.onRequest((req, res) => {
  const payload = req.body
  admin.database().ref('/function').on("value", (snapshot) => {
    const element = snapshot.val()
    
    if (element.target_channel !== payload.event.channel) {
      res.status(200).end()
      return // 対象のチャンネルでなければ終了
    }

    if (payload.event.type !== 'app_mention') {
      res.status(200).end()
      return // 投稿者が Bot でも終了
    }

    if (!payload.event.text.includes('deploy')) {
      slack.chat.postMessage({
        token: element.token,
        channel: payload.event.channel,
        text: element.error_message
      }).then(console.log).catch(console.error)
      res.status(200).end()
      return
    }

    let actions = element.actions.map(v => ({
      type: 'button',
      text: v,
      name: v
    }))
    actions.push({
      type: 'button',
      text: 'Cancel',
      name: 'Cancel',
      style: 'danger'
    })

    slack.chat.postMessage({
      token: element.token,
      channel: payload.event.channel,
      text: element.deploy_message,
      color: "#3AA3E3",
      attachments: [{
          callback_id: 'deploy_button',
          text: '',
          actions: actions
      }]
    }).then(console.log).catch(console.error)
    res.status(200).end()
  })
})

exports.deploy = functions.https.onRequest((req, res) => {
  const payload = JSON.parse(req.body.payload)
  admin.database().ref('/function').on("value", (snapshot) => {
    const element = snapshot.val()

    if (payload.actions[0].name === 'Cancel') {
      res.status(200).json({text: element.cancel_message})
      return
    }

    admin.database().ref('/function/versions/' + payload.actions[0].name).on("value", (snapshot2) => {
      const versions = snapshot2.val().split('.')
      let next_version = ''
      versions.forEach((value, index) => {
        if (index !== 0) {
          next_version += '.'
        }
        if (index === versions.length - 1) {
            value++
        }
        next_version += value
      })
      if (payload.actions[0].value === 'Deploy') {
        // TODO
        res.status(200).json({text: payload.actions[0].name + ' の v' + next_version + ' の Deploy を実行しています (*･ω･)ﾉ'})
        return
      }

      slack.chat.update({
        token: element.token,
        channel: payload.channel.id,
        text: payload.actions[0].name + ' の v' + next_version + ' を Deploy します (*･ω･)ﾉ',
        ts: payload.message_ts,
        color: "#3AA3E3",
        attachments: [{
            callback_id: 'deploy_button',
            text: '',
            actions: [
              {
                type: 'button',
                text: 'Deploy',
                name: payload.actions[0].name,
                value: 'Deploy',
                style: 'primary'
              },
              {
                type: 'button',
                text: 'Cancel',
                name: 'Cancel',
                value: 'Cancel',
                style: 'danger'
              }
            ]
        }]
      }).then(console.log).catch(console.error)
      res.status(200).end()
    })
  })
})