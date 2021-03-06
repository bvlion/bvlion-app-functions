module.exports = (functions, admin, slack, request) => functions.https.onRequest((req, res) => {
  let payload = null
  try {
    payload = JSON.parse(req.body.payload)
  } catch (_) {
    res.redirect('/a')
    return
  }

  if (!payload) {
    res.redirect('/a')
    return
  }

  admin.database().ref('/function').once("value", (snapshot) => {
    const element = snapshot.val()

    if (payload.team.id !== element.team) {
      res.redirect('/a')
      return
    }

    if (payload.actions[0].name === 'Cancel') {
      res.status(200).json({text: element.message.cancel})
      return
    }

    const ref = admin.database().ref('/function/GitHub/' + payload.actions[0].name)
    ref.once("value", (snapshot2) => {
      const github = snapshot2.val()
      const versions = github.version.split('.')
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
        const github_promise = new Promise((resolve, reject) => {
          request.post({
            uri: 'https://api.github.com/repos/' + element.user + '/' + github.name + '/releases',
            headers: {
              'Authorization': 'token ' + element.token.github,
              'User-Agent': 'Cloud Functions for Firebase'
            },
            json: {
              tag_name: 'v' + next_version,
              target_commitish: github.branch,
              name: 'v' + next_version,
              body: 'deploy 職人 pondelion が実行 (*･ω･)'
            }
          }, (error, response, _) => {
            if (error) {
              reject(error)
              return
            }
            console.log(response)
            resolve()
          })
        })

        promises([github_promise, ref.update({version: next_version})])
        return res.status(200).json({text: payload.actions[0].name + ' の v' + next_version + ' の Deploy を実行しています (*･ω･)ﾉ'})
      }

      slack.chat.update({
        token: element.token.slack,
        channel: payload.channel.id,
        text: payload.actions[0].name + ' の v' + next_version + ' を Deploy します (*･ω･)ﾉ',
        ts: payload.message_ts,
        attachments: [{
          color: "#3AA3E3",
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

async function promises(functions) {
  functions.forEach(async (func) => await func)
}