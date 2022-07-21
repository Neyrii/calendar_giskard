FROM node:18-alpine
WORKDIR /urs/app
COPY package*.json .
RUN npm ci
COPY . .
CMD ["npm", "start"]