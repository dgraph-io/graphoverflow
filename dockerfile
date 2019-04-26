FROM node:lts-alpine

WORKDIR /home/node/app
COPY ./app .

RUN npm install \
    npm cache clean --force && cd ./client/ && npm install \
    npm cache clean --force && npm run build

# application server port
EXPOSE 3000 3001

# Start the app as Dev for now
CMD npm run dev
#CMD [ "npm", "run", "serve" ]

#Note: ||> docker run -d -p 3000:3000 -p 3001:3001 $tag