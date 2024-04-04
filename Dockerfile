FROM node:20-alpine

COPY . /
RUN npm ci &&\
    npm prune --production

CMD ["npm", "start"]
