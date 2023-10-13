FROM node:18.16.1
WORKDIR /
COPY package*.json .
RUN npm install
COPY . .
CMD npm run dev