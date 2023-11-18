#!/bin/zsh

TOKEN=$1

curl -H "Authorization: token $TOKEN" -w "%{http_code}" https://api.github.com/users/andreasstrack