FROM node:17

LABEL version="1.0"
LABEL description="Base docker image for Node backend"

WORKDIR /app

COPY . .

RUN npm install --production
RUN npm i --save-dev @types/bcrypt

EXPOSE 4000

RUN npm run build
ENTRYPOINT ["npm", "start"]
