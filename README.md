# 🚀 Eurocity API

Este es el repositorio dedicado al desarrollo de la API para la aplicación Eurocity. Esta API permite la gestión de las operaciones relacionadas con la administración de almacenes e inventario de la empresa. Además de ofrecer operaciones CRUD en la base de datos, la API proporciona autenticación, autorización, gestión de sesiones de usuarios con JSON Web Tokens (JWT) y funcionalidades adicionales como el registro de proveedores, generación de reportes y manejo de respuestas HTTP enviadas al frontend.

## Diagrama de base de datos

![Eurocity Logo](https://i.postimg.cc/tRMNLmzM/euro-city-diagrama.png)

## 🛠️ Instalación

1. **Clona el repositorio en tu máquina local:**

   ```
   git clone https://github.com/KEEGAN-exe/euro-city-backend.git
   ```

2. Instala las dependencias del proyecto:
   ```
   cd eurocity-backend
   npm install
   ```
3. Ejecuta el script de la base de datos:

    ```
    eurocity_script.sql
    ```

5. Inicia el servidor backend:
   ```
   npm run dev
   ```
## 📦 Características Destacadas

- Autenticación y autorización de usuarios mediante JSON Web Tokens (JWT).
- Conexión a la base de datos MySQL para almacenamiento de datos.
- Lógica de negocio implementada para garantizar la integridad y consistencia de los datos.
- Manejo de excepciones para gestionar errores de manera controlada.
- Generación de reportes y boletas de compras para análisis y registro de transacciones.
- Respuestas HTTP optimizadas para mejorar el rendimiento y escalabilidad de la API.

## 🧰 Tecnologías Utilizadas

-	Node.js
-	Express
-	MySQL
-	JSON Web Tokens (JWT)
 
