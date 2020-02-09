
module.exports = (functions, admin, _, request) => functions.https.onRequest((req, res) => {
  let app_name = ''
  if (req.params[0] !== undefined) {
    app_name = req.params[0].slice(1)
  } else {
    res.status(403).end()
    return
  }
  if (!app_name) {
    res.status(403).end()
    return
  }
  admin.database().ref('/vsrsion').once("value", (snapshot) => {
    request({
      uri: snapshot.val().url + app_name,
      followAllRedirects: true,
    }, (error, response, _) => {
      if (error) {
        console.error(error)
        res.status(500).end()
        return
      }
      const payload = JSON.parse(response.body)
      res.status(200).json({verion: payload.code})
    })
  })
})