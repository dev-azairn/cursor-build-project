FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY renderer ./renderer
ENV NODE_ENV=production
ENV PORT=3847
EXPOSE 3847
CMD ["node", "server/index.js"]
