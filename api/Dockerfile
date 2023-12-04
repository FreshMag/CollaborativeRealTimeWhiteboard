FROM node:14

WORKDIR /collaborative-whiteboard-app
COPY package.json .
RUN npm install
COPY . .
ENV DB_IP=db
ENV FRONTEND_IP=localhost
ENV NODE_ENV=dev
CMD npm run dev