# ---- Stage 1: development (hot reload, all deps, source bind-mounted) ----
FROM node:22-alpine AS development

# Prisma's engines need OpenSSL on Alpine
# RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Schema must be present before install so Prisma's postinstall can find it
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# Generate the Prisma Client into node_modules/.prisma
RUN npm run db:generate

EXPOSE 4001
# Node 18.11+ has a built-in watcher, so no nodemon needed
CMD ["npm", "run", "dev"]


# ---- Stage 2: build (generate client -> compile -> strip devDependencies) ----
FROM development AS build

# Client is already generated above, so the compile can see Prisma's types.
# Define "build" in package.json, e.g. "build": "tsc -p tsconfig.json"
RUN npm run build && npm prune --omit=dev
 
 
# ---- Stage 3: production (compiled output only) ----
FROM node:22-alpine AS production
 
RUN apk add --no-cache openssl
 
ENV NODE_ENV=production
WORKDIR /usr/src/app
 
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/node_modules ./node_modules
# Make sure the generated client survives `npm prune`
COPY --from=development /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /usr/src/app/dist ./dist
# Needed for `prisma migrate deploy`
COPY --from=build /usr/src/app/prisma ./prisma
 
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]