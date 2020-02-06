module.exports = (functions, admin, slack, request) => functions.https.onRequest((req, res) => {
  const payload = JSON.parse(req.body.payload)
  admin.database().ref('/function').on("value", (snapshot) => {
    const element = snapshot.val()

    if (payload.actions[0].name === 'Cancel') {
      res.status(200).json({text: element.message.cancel})
      return
    }

    const ref = admin.database().ref('/function/GitHub/' + payload.actions[0].name)
    ref.on("value", (snapshot2) => {
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
            uri: 'https://api.github.com/repos/bvlion/' + github.name + '/releases',
            headers: {
              'Authorization': 'token ' + element.token.github
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
            resolve(response)
          })
        })

        const circleci_promise = new Promise((resolve, reject) => { 
          request.post({
            uri: 'https://circleci.com/api/v2/project/github/bvlion/' + github.name + '/pipeline',
            json: {
              tag: 'v' + next_version,
              parameters: {
                run_build: true
              }
            },
            auth: {
              user: element.token.circleci,
              password: ''
            }
          }, (error, response, _) => {
            if (error) {
              reject(error)
              return
            }
            resolve(response)
          })
        })

        const update_promise = new Promise((resolve, _) => { 
          ref.update({version: next_version})
          resolve()
        })

        Promise.all([github_promise, circleci_promise, update_promise])
          .then((message) => {
            message.forEach(console.log)
            slack.chat.update({
              token: element.token.slack,
              channel: payload.channel.id,
              text: payload.actions[0].name + ' の v' + next_version + ' の Deploy を実行しています (*･ω･)ﾉ',
              ts: payload.message_ts,
            }).then(console.log).catch(console.error)
            return res.status(200).end()
          }).catch((error) =>{
            console.error(error)
            return res.status(500).end()
          })
        return
      }

      slack.chat.update({
        token: element.token.slack,
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