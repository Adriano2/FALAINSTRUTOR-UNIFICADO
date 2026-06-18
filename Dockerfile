# Imagem única que builda o front-end e roda o backend (API + estáticos).
# Útil para Railway (Nixpacks também funciona), Google Cloud Run ou VPS.

FROM node:22-slim AS base
WORKDIR /app

# Prisma precisa do OpenSSL no runtime.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Instala dependências (inclui dev: necessárias para build e Prisma CLI).
COPY package*.json ./
RUN npm install

# Copia o restante do código e gera artefatos.
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
# A maioria das plataformas injeta PORT; o servidor usa process.env.PORT.
EXPOSE 8787

# Aplica migrações antes de iniciar o servidor.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
