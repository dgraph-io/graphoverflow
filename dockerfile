FROM node:lts-alpine AS builder

#RUN apk add --no-cache tini git

WORKDIR /home/node/app
COPY ./app .

RUN npm install \
    npm cache clean --force && cd ./client/ && npm install \
    npm cache clean --force && npm run build

# ENTRYPOINT ["/sbin/tini", "--"]

EXPOSE 3000

# Start the app
# CMD npm run dev
CMD ["-c"]