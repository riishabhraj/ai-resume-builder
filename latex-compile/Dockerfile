FROM node:18-alpine

RUN apk add --no-cache \
    texlive \
    texlive-xetex \
    texlive-luatex \
    texmf-dist \
    texmf-dist-most \
    texmf-dist-latexextra \
    texmf-dist-fontsextra

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY server.js ./

EXPOSE 3001

CMD ["node", "server.js"]
