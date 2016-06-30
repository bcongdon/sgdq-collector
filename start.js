var forever = require('forever')

var sgdq_collector  = new (forever.Monitor)('sgdq_collector.js',{
  'outFile': './sgdq-collector.log',
  'errFile': './sgdq-err.log'
});
var chat_collector  = new (forever.Monitor)('chat_collector.js',{
  'outFile': './chat-collector.log',
  'errFile': './chat-err.log'
});
var tweet_collector = new (forever.Monitor)('tweet_collector.js',{
  'outFile': './tweet-collector.log',
  'errFile': './tweet-err.log'
});
var storage_link = new (forever.Monitor)('storage_link.js',{
  'outFile': './storage-link.log',
  'errFile': './storage-err.log'
});

sgdq_collector.start();
chat_collector.start();
tweet_collector.start();
storage_link.start();

forever.startServer(sgdq_collector, chat_collector, tweet_collector, storage_link);
