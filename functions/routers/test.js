
module.exports = (functions, admin, slack, _) =>
  functions.https.onRequest((req, res) => res.status(200).send(req.body))