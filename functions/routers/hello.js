module.exports = (functions, admin, slack, _) => functions.https.onRequest((req, res) => {
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