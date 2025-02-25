

echo "Building app..."
npm run build

echo "Deploying files to server..."
scp -r -P 3333 build/* abu@185.39.31.76:/var/www/185.39.31.76/

echo "Done!"