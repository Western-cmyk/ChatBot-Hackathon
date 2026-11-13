# Fluenta en Railway: Railway usa este Dockerfile automaticamente.
#
# Etapa 1: compila la app de React (necesita las devDependencies).
# Etapa 2: solo Node + dist/ + server/. El servidor no tiene dependencias,
#          asi que la imagen final no lleva node_modules.

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
USER node
# Railway inyecta PORT; server/index.mjs ya lo lee.
CMD ["node", "server/index.mjs"]
