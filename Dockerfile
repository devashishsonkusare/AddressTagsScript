FROM node:14
ENV PROJECT_DIR=/etl
RUN mkdir -p $PROJECT_DIR
WORKDIR /$PROJECT_DIR
ADD BitcoinScript.js BitcoinScript.js
ADD package.json package.json
RUN npm install
RUN npm install pg
RUN npm install axios 
EXPOSE 3000
ENTRYPOINT ["node", "BitcoinScript.js"]
