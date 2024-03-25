FROM node:18.14.2-alpine
ENV PROJECT_DIR=/etl
RUN mkdir -p $PROJECT_DIR
WORKDIR /$PROJECT_DIR
COPY package.json /$PROJECT_DIR/package.json
RUN npm cache clean --force && \
    npm install --loglevel verbose --legacy-peer-deps
COPY BitcoinScript.js /$PROJECT_DIR/BitcoinScript.js
EXPOSE 3000
CMD ["npm", "start"]
