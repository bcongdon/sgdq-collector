var firebase = require('firebase');

var exports = module.exports;

firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});

exports.database = firebase.database();