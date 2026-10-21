# ---- Stage 1: development (hot reload, all deps, source bind-mounted) ----
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4003
CMD ["npm", "run", "start:dev"]


# ---- Stage 2: test (runs unit and integration tests) ----
FROM development AS test

CMD ["npm", "run", "test"]


# ---- Stage 3: build (compile TS, then strip devDependencies) ----
FROM development AS build

RUN npm run build && npm prune --omit=dev


# ---- Stage 4: production (small image, compiled output only) ----
FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node
EXPOSE 4003
CMD ["node", "dist/main.js"]
