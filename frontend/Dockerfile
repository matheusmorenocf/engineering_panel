# ============================================
# FRONTEND DOCKERFILE - Next.js
# Painel Engenharia
# Otimizado para desenvolvimento com hot reload
# ============================================

FROM node:20-slim

# Variáveis de ambiente
ENV NODE_ENV=development

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos
COPY . .

# Expor porta do Next.js
EXPOSE 3000

# Comando para desenvolvimento (hot reload)
CMD ["npm", "run", "dev"]