FROM node:20.20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY db/ ./db/

USER node
EXPOSE 3001
CMD ["node", "src/index.js"]
