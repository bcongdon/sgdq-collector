# Designed to be run on a Google Compute Engine instance
apt-get update
apt-get install git npm tmux python-pip -y
npm install -g n forever
n lts
sudo pip install bs4
git clone https://github.com/bcongdon/sgdq-collector
cd sgdq-collector
npm install
tmux
