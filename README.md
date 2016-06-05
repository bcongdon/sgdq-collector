# sgdq-collector
> :video_game: Backend data collector for SGDQ-Stats


## Tools
* NodeJS
    * node-scheduler for scheduling
    * scrape-it for scraping donation page
    * tmi.js for Twitch.tv data
* Firebase for backend storage
* MongoDB for local backup (and more data storage for later use)

## Firebase Schema
* `data` => Holds collection of data points
	* `<epoch time>` => Entry
		* `m` => Total donations ($)
		* `d` => Total num donators
		* `v` => Number of Twitch viewrs
* `games` => Holds collection of games
	* `name` => Name of game
	* `start` => Start of game in block (epoch time)
* `stats`
	* `avg_donation` => Average donation ammount ($)
	* `max_donation` => Largest donation ammount ($)
	* `num_donators` => Number of individual donations (not a perfect 1-to-1 map, but close enough)
	* `total_donations` => Sum of all donations ($)