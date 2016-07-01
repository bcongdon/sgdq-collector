forever start -o ./sgdq_collector.log  -e ./sgdq_collector.err  -f sgdq_collector.js
forever start -o ./chat_collector.log  -e ./chat_collector.err  -f chat_collector.js
forever start -o ./tweet_collector.log -e ./tweet_collector.err -f tweet_collector.js
forever start -o ./storage_link.log    -e ./storage_link.err    -f storage_link.js
