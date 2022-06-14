FROM node:14.19.3

LABEL version="1.0"
LABEL description="Base docker image for Node backend"

WORKDIR /app

COPY . .

RUN npm install --production

EXPOSE 4000

RUN npm run build
RUN npm run prisma
ENTRYPOINT ["./setup.sh"]