FROM node:23-slim

# install node
WORKDIR /usr/local/app

# install node packages
COPY package*.json ./
RUN npm install

COPY . /usr/local/app/