# frontend/Dockerfile
FROM node:20-slim

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza cache do Docker)
COPY package*.json ./

# Instala as dependências (em dev, npm install é suficiente)
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# O parâmetro --host é passado via docker-compose, mas deixamos aqui como fallback
CMD ["npm", "run", "dev", "--", "--host"]