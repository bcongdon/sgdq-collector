from bs4 import BeautifulSoup
import requests
import json

html = requests.get("http://gamesdonequick.com/schedule").text
soup = BeautifulSoup(html, 'html.parser')
table = soup.find('tbody')

first_rows = table.findAll('tr', attrs={'class': None})
games = list()
for row in first_rows:
    second_row = row.findNext('tr', attrs={'class': 'second-row'})
    duration = 0
    if second_row:
        duration = second_row.findNext('td').text.strip()
    runner_text = row.find('td', attrs={'rowspan': 2})
    runner = runner_text.text.strip() if runner_text else ""
    start_time_text = row.find('td', attrs={'class': "start-time"})
    start_time = start_time_text.text if start_time_text else ""
    game = {
        'title': row.find('td', attrs={'class': None}).text,
        'duration': duration,
        'runner': runner,
        'start_time': start_time,
    }
    games.append(game)
blacklist = ['Pre-Show', 'Setup Block', 'TAS', 'Finale']
games = [x for x in games if not any(x['title'].startswith(b) for b in blacklist)]

with open('data_file.json', 'w+') as f:
    f.write(json.dumps(games))