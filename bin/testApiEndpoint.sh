#!/bin/zsh

URL="$1"/orders

echo Sending test event to $URL

curl -X POST -H "Content-Type: application/json" -d '[{"record_id": "unique_id_1","parameter_1": "abc","parameter_2": 4},{"record_id": "unique_id_2","parameter_1": "def","parameter_2": 2.1}]' -w "%{http_code}" $URL