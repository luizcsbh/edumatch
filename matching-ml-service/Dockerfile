FROM node:20-bookworm-slim

WORKDIR /app

# Install native dependencies required by tensorflow node
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
