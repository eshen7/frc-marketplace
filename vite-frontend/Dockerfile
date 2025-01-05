FROM node:23 AS builder

# install node
WORKDIR /usr/local/app

# install node packages
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

COPY . /usr/local/app/

# Production image to serve the build output
FROM nginx:latest

# Copy the built frontend to the nginx web server
COPY --from=builder /usr/local/app/dist /usr/share/nginx/html

EXPOSE 80