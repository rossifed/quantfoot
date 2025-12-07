#!/bin/bash

echo "Starting Players API..."
cd /home/rossifed/dev/quantfoot/services/dotnet/Players/Players.Api
dotnet run &
API_PID=$!

echo "Waiting for API to start..."
sleep 6

echo -e "\nTesting GET /api/players endpoint..."
curl -s http://localhost:5087/api/players | python3 -m json.tool | head -80

echo -e "\n\nTesting GET /api/players/431118 endpoint..."
curl -s http://localhost:5087/api/players/431118 | python3 -m json.tool

echo -e "\n\nStopping API (PID: $API_PID)..."
kill $API_PID

echo "Done!"
