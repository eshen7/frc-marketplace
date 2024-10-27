FROM node:23-slim

# install node
WORKDIR /usr/local/app

# install node packages
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm","run","dev","--host","0.0.0.0","--port","5173"]

