var forever = require('forever')

var sgdq_collector  = new (forever.Monitor)('sgdq_collector.js',{
  'outFile': './sgdq_collector.log',
  'errFile': './sgdq_collector.err'
});
var chat_collector  = new (forever.Monitor)('chat_collector.js',{
  'outFile': './chat_collector.log',
  'errFile': './chat_collector.err'
});
var tweet_collector = new (forever.Monitor)('tweet_collector.js',{
  'outFile': './tweet_collector.log',
  'errFile': './tweet_collector.err'
});
var tweet_sender = new (forever.Monitor)('tweet_sender.js',{
  'outFile': './tweet_sender.log',
  'errFile': './tweet_sender.err'
});
var storage_link = new (forever.Monitor)('storage_link.js',{
  'outFile': './storage_link.log',
  'errFile': './storage_link.err'
});
var games_push = new (forever.Monitor)('populate_firebase_games.js',{
  'outFile': './populate_firebase-games.log',
  'errFile': './populate_firebase-games.err'
});

sgdq_collector.start();
chat_collector.start();
tweet_collector.start();
tweet_sender.start();
storage_link.start();
games_push.start();

forever.startServer(sgdq_collector, 
  chat_collector,
  tweet_collector,
  tweet_sender,
  storage_link,
  games_push
);
