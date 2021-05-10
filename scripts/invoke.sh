#!/bin/bash -e

sam local invoke --debug --env-vars ./test/variables.json --event "./test/events/${1}/${2:6}.json" "$2"
