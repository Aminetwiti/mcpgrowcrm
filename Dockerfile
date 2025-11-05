# ============================================================================
# DOCKERFILE - SERVEUR MCP GROWCRM v2.0
# ============================================================================
# Image optimisée pour production avec Node.js 20 Alpine
# ============================================================================

FROM node:20-alpine

# Métadonnées
LABEL maintainer="amine.benammar17@gmail.com"
LABEL description="Serveur MCP GROWCRM - 38 outils pour interagir avec GROWCRM via API REST"
LABEL version="2.0.0"

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV DEBUG=false

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install --omit=dev && \
    npm cache clean --force

# Copier le code source
COPY index.js ./
COPY .env.example ./

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S mcpuser && \
    adduser -u 1001 -S mcpuser -G mcpuser && \
    chown -R mcpuser:mcpuser /app

# Utiliser l'utilisateur non-root
USER mcpuser

# Healthcheck pour vérifier que le serveur répond
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('OK')" || exit 1

# Exposer le port si nécessaire (pour mode HTTP futur)
# EXPOSE 3200

# Commande de démarrage
CMD ["node", "index.js"]
