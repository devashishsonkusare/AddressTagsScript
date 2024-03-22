FROM node:14
ENV PROJECT_DIR=/etl
RUN mkdir -p $PROJECT_DIR
WORKDIR /$PROJECT_DIR
ADD BitcoinScript.js BitcoinScript.js
RUN npm install
EXPOSE 3000
entrypoint ["node", "BitcoinScript.js"]