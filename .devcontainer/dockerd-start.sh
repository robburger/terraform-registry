#!/bin/sh
set -e

# Start Docker Daemon
/usr/local/bin/dockerd \
  --host=unix:///var/run/docker.sock \
  --host=tcp://127.0.0.1:2375 \
  &

# Wait until 'docker info' exits successfully, or timeout after 30 seconds
tries=0
d_timeout=30
until docker info >/dev/null 2>&1
do
  if [ "$tries" -gt "$d_timeout" ]; then
    echo 'Timed out trying to connect to internal docker host.' >&2
    exit 1
  fi
    tries=$(( tries + 1 ))
  sleep 1
done
