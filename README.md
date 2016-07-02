# sgdq-collector
> :video_game: Backend data collector for SGDQ-Stats


## Tools
* NodeJS
    * [node-scheduler](https://www.npmjs.com/package/node-schedule) for scheduling
    * [scrape-it](https://github.com/IonicaBizau/scrape-it) for scraping donation page
    * [tmi.js](tmijs.org) for Twitch.tv data
    * [forever](https://github.com/foreverjs/forever) for managing all the scripts and restarting them if anything crashes.
* Firebase for backend storage
* Google Compute Engine as the hardware running the scripts
* Google Cloud Storage as the cache location for the JSON dataset

## Data Sources
* All Twitch data is acquired with [tmi.js](https://www.tmijs.org/). Viewership data is gained by polling the API every minute. The collector listens in on the chat and reports messages per minute, as well as emote data (by referencing the Twitch global emote list).
* Twitter data is collected by listening to a Twitter stream with the terms `sgdq`, `summergamesdonequick`, `sgdq2016`, `#sgdq2016`.
* Donations / Donator data is scraped from the [SGDQ Donation Tracker](https://gamesdonequick.com/tracker/index/sgdq2016).

## Frontend
These scripts collect data for the data visualizations done in [SGDQ-Stats](https://github.com/bcongdon/sgdq-stats).

## Firebase Schema
* `data` => Holds collection of data points
	* `<epoch time>` => Entry
		* `m` => Total donations ($)
		* `d` => Total num donators
		* `v` => Number of Twitch viewers
* `games` => Holds collection of games
	* `<epoch time>` => Start time of game
		* `title` => Name of game
		* `runner` => Name of speed runner
		* `duration` => Planned duration of game's run
		* `start_time` => Start time of game's run in epoch time (Redundant...)
* `stats`
	* `avg_donation` => Average donation amount ($)
	* `games_played` => Number of games played so far in the marathon
	* `max_donation` => Largest donation ammount ($)
	* `num_donators` => Number of individual donations (not a perfect 1-to-1 map, but close enough)
	* `total_chats` => Total number of chat messages sent in the Twitch Chat
	* `total_donations` => Sum of all donations ($)
	* `total_emotes` => Total number of emotes sent in the Twitch Chat
	* `total_tweets` => Total number of Tweets sent related to SGDQ
* `extras` => Interesting, but less useful stats
	* `<epoch time>` => Entry
		* `c` => Number of Twitch chats sent
		* `e` => Number of Twitch emotes sent
		* `t` => Number of SGDQ-related Tweets sent