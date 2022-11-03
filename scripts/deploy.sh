#!/usr/bin/env bash

PROJECT_ID=$(gcloud config list --format 'value(core.project)')

function join_array {
    local arr=("$@")
    local result="$(
        IFS=,
        echo "${arr[*]}"
    )"
    echo "$result"
}

SECRETS=(
    "APP_KEY=MEVWATCH_TWITTER_APP_KEY:latest"
    "APP_SECRET=MEVWATCH_TWITTER_APP_SECRET:latest"
    "BOT_TOKEN=MEVWATCH_TWITTER_BOT_TOKEN:latest"
    "BOT_SECRET=MEVWATCH_TWITTER_BOT_SECRET:latest"
)

gcloud functions deploy mevwatch-bot --region=us-central1 --memory=1024Mi --runtime nodejs16 \
    --allow-unauthenticated --entry-point=handlePubSub --trigger-topic=noon \
    --set-secrets="$(join_array "${SECRETS[@]}")" --gen2
