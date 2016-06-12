# Designed to be run on a Google Compute Engine instance
apt-get install git mongodb-clients mongodb-server -y
mkdir -p /data/db
git clone https://github.com/bcongdon/sgdq-collector
cd sgdq-collector
npm install
cd ..
npm install -g forever
echo "forever start sgdq-collector/index.js" > start.sh
chmod +x start.sh
vim sgdq-collector/credentials.json

