echo "---------------------------------"
echo "  TuberIA Deployment Automation  "
echo "---------------------------------"
echo ""

echo "[1/5] Changing directory to App Source..."
cd ~/TuberIA

echo ""

echo "[2/5] Stopping production Docker container..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
echo "[+] Docker Container Stopped Successfully"

echo ""

echo "[3/5] Pulling Latest GitHub main branch changes"
git pull origin main

echo ""

echo "[4/5] Building production images..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
echo "[+] Docker Image Built Successfully"

echo ""

echo "[5/5] Starting production docker containers"
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "[+] Docker Container Started Successfully"

echo ""
echo "---------------------------------"
echo "TuberIA Deployed Succssfully :D"
echo ""