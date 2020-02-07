const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
const Slack = require('slack')
const slack = new Slack()
const request = require('request')

const funcs = [
  'test',
  'hello',
  'deploy',
  'pull_request'
]

funcs
  .filter((name) => !process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name)
  .forEach((name) => exports[name] = require('./routers/' + name)(functions, admin, slack, request))