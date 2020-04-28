#!/bin/sh


function wait_for_healthy() {
    echo "wait-for-healthy: Waiting for $1 to return 200 OK"
    tries=0
    until curl -sL -w "%{http_code}\\n" "$1" -o /dev/null | grep -q 200; do
        tries=$tries+1
        if [[ $tries -gt 300 ]]; then
            echo "wait-for-healthy: Took longer than 1 minute to be healthy."
            echo "wait-for-healthy: Waiting stopped."
            return 1
        fi
        sleep 0.2
    done
    echo "wait-for-healthy: Done."
}

wait_for_healthy alpha:8080/health

curl -s -H "Content-Type: application/graphql+-" \
-X POST alpha:8080/query -d $'{ q(func: has(runOnce)){ runOnce }}' | grep -o '"runOnce": *"[^"]*' \
 | grep -o '[^"]*$' && echo "Nothing to do... starting app" && yarn dev || echo "Starting Setup..." 

echo

# Define Schema
curl -X POST alpha:8080/alter --data-binary '@schema.txt'

echo
sleep 3
echo

# Create fake user
curl -H "Content-Type: application/rdf" -X POST 'alpha:8080/mutate?commitNow=true' -d $'{  set {
    <_:user> <DisplayName> "micheldiz" .
    <_:user> <GitHubAccessToken> "${some accessToken}" .
    <_:user> <GitHubID> "${some GitHubID}" .
    <_:user> <Reputation> "0" .
    <_:user> <CreationDate> "0" .
    <_:user> <LastAccessDate> "0" .
    <_:user> <Location> "Earth" .
    <_:user> <Type> "User" .
  }}'

echo
sleep 3
echo

# Mark to just run once
curl -H "Content-Type: application/rdf" -X POST 'alpha:8080/mutate?commitNow=true' -d $'{set {  _:check <runOnce> "true" . }}'

# Start app
yarn dev