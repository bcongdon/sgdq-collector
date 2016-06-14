var forever = require('forever')

var sgdq_collector  = new (forever.Monitor)('sgdq_collector.js');
var chat_collector  = new (forever.Monitor)('chat_collector.js');
var tweet_collector = new (forever.Monitor)('tweet_collector.js');

sgdq_collector.start();
chat_collector.start();
tweet_collector.start();

forever.startServer(sgdq_collector, chat_collector, tweet_collector);