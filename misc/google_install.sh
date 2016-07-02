# Designed to be run on a Google Compute Engine instance
apt-get update
apt-get install git npm tmux -y
npm install -g n forever
n lts
git clone https://github.com/bcongdon/sgdq-collector
cd sgdq-collector
npm install
tmux
