FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]