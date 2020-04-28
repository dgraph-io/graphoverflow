FROM node:lts-alpine

WORKDIR /home/node/app
COPY ./runCompose.sh ./runCompose.sh
COPY ./schema.txt ./schema.txt
COPY ./app .

# I have added python cuz the logs from the node build was requesting.
# You can remove it, keep the curl.
RUN apk add --update-cache \
    curl \
    python \
    python-dev \
    py-pip \
  && pip install virtualenv \
  && rm -rf /var/cache/apk/*  \
  && yarn \
  && cd ./client/ && yarn \
  && yarn build

# application server port
EXPOSE 3000 3001
