const crypto = require('crypto')

module.exports = (functions, admin, _, request) => functions.https.onRequest((req, res) => {
  const payload = req.body
  admin.database().ref('/function').once("value", (snapshot) => {
    const element = snapshot.val()
    const json_string = JSON.stringify(payload)

    const sig = req.get('X-Hub-Signature') || ''
    const hmac = crypto.createHmac('sha1', element.GitHub.secret)
    const digest = Buffer.from('sha1=' + hmac.update(json_string).digest('hex'), 'utf8')
    const checksum = Buffer.from(sig, 'utf8')
    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
      console.error(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`)
      res.redirect('/a')
      return
    }

    request.post({
      uri: 'https://circleci.com/api/v2/project/github/' + element.user + '/' + payload.repository.name + '/pipeline',
      json: {
        branch: payload.pull_request.head.ref,
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
        console.error(error)
        res.status(500).end()
        return
      }
      res.status(200).end()
      console.log(response)
    })
  })
})