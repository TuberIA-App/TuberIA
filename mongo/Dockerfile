# Usar la imagen oficial de MongoDB
FROM mongo:7.0

# Copiar el script de inicialización
COPY mongo-init.js /docker-entrypoint-initdb.d/

# Exponer el puerto predeterminado de MongoDB
EXPOSE 27017