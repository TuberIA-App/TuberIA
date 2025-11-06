# Usar la imagen oficial de MongoDB
FROM mongo:5.0.26

# Copiar el script de inicialización
COPY mongo-init.js /docker-entrypoint-initdb.d/

# Exponer el puerto predeterminado de MongoDB
EXPOSE 27017