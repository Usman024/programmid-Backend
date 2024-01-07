FROM node:16-alpine3.15

WORKDIR /usr/god

COPY package*.json ./

RUN npm install --force

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "start"]