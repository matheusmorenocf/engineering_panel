# Usa uma imagem leve do Node.js
FROM node:20-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração de pacotes
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código do frontend para o container
COPY . .

# Expõe a porta padrão que o Vite utiliza
EXPOSE 5173

# Comando para rodar o servidor de desenvolvimento do Vite
# O parâmetro --host é crucial para que o Docker consiga acessar o servidor
CMD ["npm", "run", "dev", "--", "--host"]