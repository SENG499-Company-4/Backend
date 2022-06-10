FROM node:14.19.3

LABEL version="1.0"
LABEL description="Base docker image for Node backend"

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

EXPOSE 4000

RUN npm run build
RUN npm run prisma

CMD ["npm", "run", "dev"]

# CMD ["./wait-for-it.sh", "backend-postgres:5432", "--", "npm", "run", "migrate", "&&", "npm", "run", "dev"]