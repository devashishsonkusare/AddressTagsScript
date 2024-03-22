FROM node:14
ENV PROJECT_DIR=/etl
RUN mkdir -p $PROJECT_DIR
WORKDIR /$PROJECT_DIR
COPY BitcoinScript.js /$PROJECT_DIR/BitcoinScript.js
COPY package.json /$PROJECT_DIR/package.json
RUN npm install -f
EXPOSE 3000
ENTRYPOINT ["node", "BitcoinScript.js"]
