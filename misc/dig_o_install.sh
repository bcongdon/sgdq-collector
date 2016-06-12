# Designed to be run on a DigitalOcean Node.js droplet
apt-get install git mongodb-clients mongodb-server -y
mkdir -p /data/db
mongod --fork --logpath /var/log/mongod.log
git clone https://github.com/bcongdon/sgdq-collector
cd sgdq-collector
npm install
cd ..
npm install -g forever
echo "forever start sgdq-collector/index.js" > start.sh
chmod +x start.sh
vim sgdq-collector/credentials.json

