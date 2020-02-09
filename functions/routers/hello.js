module.exports = (functions, admin, slack, _) => functions.https.onRequest((req, res) => {
  const payload = req.body
  if (!payload || !payload.event) {
    res.redirect('/a')
    return
  }

  admin.database().ref('/function').once("value", (snapshot) => {
    const element = snapshot.val()

    if (!payload.event.team_id !== element.team) {
      res.redirect('/a')
      return
    }
    
    if (element.target_channel !== payload.event.channel) {
      slack.chat.postMessage({
        token: element.token.slack,
        channel: payload.event.channel,
        text: element.message.channel
      }).then(console.log).catch(console.error)
      res.status(200).end()
      return
    }

    if (payload.event.type !== 'app_mention') {
      res.status(200).end()
      return
    }

    if (!payload.event.text.includes('deploy')) {
      slack.chat.postMessage({
        token: element.token.slack,
        channel: payload.event.channel,
        text: element.message.error
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
      token: element.token.slack,
      channel: payload.event.channel,
      text: element.message.deploy,
      attachments: [{
        color: "#3AA3E3",
        callback_id: 'deploy_button',
        text: '',
        actions: actions
      }]
    }).then(console.log).catch(console.error)
    res.status(200).end()
  })
})