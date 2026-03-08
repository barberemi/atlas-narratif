# On utilise une version légère de Node
FROM node:20-alpine

WORKDIR /app

# On installe les dépendances en premier (optimisation du cache Docker)
COPY package*.json ./
RUN npm install

# On copie le reste des fichiers
COPY . .

# On expose le port de Vite
EXPOSE 5173

# Le container reste actif sans lancer de commande automatiquement
CMD ["tail", "-f", "/dev/null"]
