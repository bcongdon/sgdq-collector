var forever = require('forever')

var sgdq_collector  = new (forever.Monitor)('sgdq_collector.js',{
  'outFile': './sgdq-collector.log',
  'errFile': './sgdq-collector.err'
});
var chat_collector  = new (forever.Monitor)('chat_collector.js',{
  'outFile': './chat-collector.log',
  'errFile': './chat-collector.err'
});
var tweet_collector = new (forever.Monitor)('tweet_collector.js',{
  'outFile': './tweet-collector.log',
  'errFile': './tweet-collector.err'
});
var tweet_sender = new (forever.Monitor)('tweet_sender.js',{
  'outFile': './tweet-sender.log',
  'errFile': './tweet-sender.err'
});
var storage_link = new (forever.Monitor)('storage_link.js',{
  'outFile': './storage-link.log',
  'errFile': './storage-link.err'
});

sgdq_collector.start();
chat_collector.start();
tweet_collector.start();
tweet_sender.start();
storage_link.start();

forever.startServer(sgdq_collector, 
  chat_collector,
  tweet_collector,
  tweet_sender,
  storage_link
);
