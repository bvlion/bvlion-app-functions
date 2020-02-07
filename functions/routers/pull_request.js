module.exports = (functions, admin, _, request) => functions.https.onRequest((req, res) => {
  console.log(req.body)
  const payload = JSON.parse(req.body)
  console.log(payload)
  admin.database().ref('/function').once("value", (snapshot) => {
    const element = snapshot.val()

    request.post({
      uri: 'https://circleci.com/api/v2/project/github/' + element.user + '/' + payload.repository.name + '/pipeline',
      json: {
        branch: payload.check_run.check_suite.head_branch,
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