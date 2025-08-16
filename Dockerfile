# Estágio de Build: Compila o código TypeScript
FROM node:20-slim AS builder

# Instala dependências de sistema necessárias para o Baileys
# As dependências podem variar, mas estas cobrem a maioria dos casos.
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    libgbm-dev \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY ./src ./src

# Compila o projeto
RUN npm run build

# ---

# Estágio de Produção: Executa o bot
FROM node:20-slim

# Reinstala apenas as dependências de sistema para a execução
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgbm-dev \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    lsb-release \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /usr/src/app

USER node

# Copia os artefatos do estágio de build
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --chown=node:node package.json .
COPY --from=builder --chown=node:node /usr/src/app/src/resources ./dist/resources

# Expõe a porta, caso seu app tenha uma API (opcional)
# EXPOSE 3000

# Comando para iniciar o bot
CMD [ "npm", "start" ]
