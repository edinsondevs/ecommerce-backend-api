# 📦 E-Commerce Inventory API (Fastify + Prisma + Zod)

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge)

Una API RESTful de nivel de producción para la gestión de inventario y autenticación de un E-commerce. Este proyecto demuestra la implementación de buenas prácticas de desarrollo backend, arquitectura limpia, seguridad por diseño y pruebas exhaustivas utilizando el ecosistema moderno de Node.js.

## 🚀 Tecnologías Principales

* **Framework Web:** [Fastify](https://www.fastify.io/) - Elegido por su altísimo rendimiento y bajo overhead.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estático para código predecible.
* **ORM:** [Prisma v5](https://www.prisma.io/) - Gestión de base de datos tipada de extremo a extremo.
* **Base de Datos:** PostgreSQL alojado en [Supabase](https://supabase.com/).
* **Validación:** [Zod](https://zod.dev/) + `fastify-type-provider-zod` - Validación de esquemas en tiempo de ejecución y tipado inferido.
* **Autenticación y Seguridad:** JWT (JSON Web Tokens) vía `@fastify/jwt` y hashing de contraseñas con `bcrypt`.
* **Testing:** [Vitest](https://vitest.dev/) con c8/v8 para Coverage - Framework de pruebas ultrarrápido con **100% de cobertura**. Implementación de pruebas de integración (vía `.inject()`) y unitarias con Mocks (`vi.spyOn`).
* **Documentación:** [Swagger (OpenAPI)](https://swagger.io/) - Documentación interactiva y autogenerada conectada directamente a los esquemas de Zod.

## 🧠 Decisiones de Arquitectura Destacadas

1. **Validación en la "Frontera":** Uso estricto de Zod inyectado en las opciones de las rutas de Fastify. Ninguna petición mal formada llega a la capa de servicios o a la base de datos.
2. **Seguridad y Autenticación Centralizada:** Las rutas privadas están protegidas por un "Guardia" (Decorador de Fastify) que verifica el token JWT antes de permitir el acceso a los controladores.
3. **Manejador Global de Errores (Error Handler):** Centralización de los errores. Los códigos de Prisma (ej. `P2002` de duplicados o `P2025` de no encontrados), los errores de validación y de autenticación se interceptan y formatean en respuestas HTTP limpias (`400`, `401`, `404`, `409`), evitando filtrar información sensible al cliente (`500`).
4. **Soft Delete (Borrado Lógico):** Los productos no se eliminan físicamente de la base de datos para mantener la integridad referencial y el historial; en su lugar, se actualiza una bandera `isActive`.
5. **Clean Architecture:** Separación clara de responsabilidades en capas lógicas (`Routes`, `Controllers/Services`, `Schemas`, `Plugins`).
6. **Estrategia de Testing Híbrida (100% Coverage):** Uso del método `.inject()` de Fastify para pruebas de integración sin levantar puertos reales, y uso intensivo de Mocks/Spies para aislar la capa de servicios de la base de datos durante las pruebas unitarias, garantizando tests rápidos, deterministas y una cobertura absoluta.

## 📁 Estructura del Proyecto

```text
src/
 ├── config/           # Configuraciones globales (Variables de entorno, instancia Prisma)
 ├── plugins/          # Plugins de Fastify (Manejador de errores, Swagger)
 ├── routes/           # Definición de endpoints HTTP y asociación de esquemas Zod
 ├── services/         # Lógica de negocio pura e interacciones con la Base de Datos
 ├── schemas/          # Esquemas de validación de entrada/salida (Zod)
 ├── tests/            # Suite de pruebas automatizadas (Unitarias e Integración)
 └── app.ts            # Punto de entrada y configuración del servidor Fastify
prisma/
 └── schema.prisma     # Modelado de datos (User, Product) y configuración del ORM
```

## 🛠️ Instalación y Configuración Local

### 1. Prerrequisitos
* [Node.js](https://nodejs.org/) (v18 o superior)
* Una cuenta en [Supabase](https://supabase.com/) (o cualquier base de datos PostgreSQL)

### 2. Clonar el repositorio
```bash
git clone <tu-url-del-repositorio>
cd ecommerce-backend_v2
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de base de datos:
```env
# Puerto 6543 (Pooler) ideal para entornos serverless/Node
DATABASE_URL="postgres://usuario:password@host:6543/postgres?pgbouncer=true"

# Puerto 5432 (Conexión Directa) usado por Prisma CLI para migraciones
DIRECT_URL="postgres://usuario:password@host:5432/postgres"

# Secreto para la firma de Tokens JWT
JWT_SECRET="tu_clave_super_secreta_2026"

PORT=3000
```

### 5. Sincronizar la Base de Datos
Ejecuta las migraciones para crear las tablas en tu base de datos:
```bash
npx prisma migrate dev --name init
```

### 6. Levantar el Servidor (Modo Desarrollo)
Utilizamos `tsx` para una ejecución rápida de TypeScript.
```bash
npm run dev
```
El servidor estará disponible en: `http://localhost:3000`

## 📖 Documentación Interactiva (Swagger)

La API cuenta con documentación autogenerada y tipada. Una vez que el servidor esté corriendo en modo desarrollo, puedes acceder a la interfaz gráfica de Swagger UI en:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

> **🔐 Nota de Seguridad:** Esta API cuenta con rutas protegidas. Para interactuar con los métodos `POST`, `PUT` y `DELETE` de productos, primero debes hacer **Login** (o registrarte) en el endpoint `/api/auth/login`. Copia el token JWT que te devuelve la respuesta y utilízalo en el botón verde **"Authorize"** en la parte superior derecha de la página de Swagger.

## 📡 Endpoints de la API (Referencia Rápida)

### 🛡️ Autenticación
| Método | Endpoint | Descripción | Body (Ejemplo) |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Registra un nuevo usuario encriptando su contraseña. | `{"email": "admin@test.com", "password": "secure123", "name": "Admin"}` |
| **POST** | `/api/auth/login` | Inicia sesión y devuelve un token JWT. | `{"email": "admin@test.com", "password": "secure123"}` |

### 📦 Inventario (Productos)
| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Lista todos los productos activos. Filtra por `?stock=X`. | Público 🌐 |
| **GET** | `/api/products/:id` | Obtiene los detalles de un producto específico. | Público 🌐 |
| **POST** | `/api/products` | Crea un nuevo producto. | Privado 🔒 (Requiere JWT) |
| **PUT** | `/api/products/:id` | Actualiza un producto existente (Campos opcionales). | Privado 🔒 (Requiere JWT) |
| **DELETE**| `/api/products/:id` | Realiza un Soft Delete (Desactiva el producto). | Privado 🔒 (Requiere JWT) |

*(Nota: Todos los endpoints cuentan con validación estricta en la entrada y en la respuesta. Si se envía un SKU incorrecto, o un precio negativo, la API retornará un `400 Bad Request` automático).*

## 🧪 Pruebas y Cobertura

Para ejecutar la suite completa de pruebas que garantiza el correcto funcionamiento de las rutas, autenticación, manejador de errores y lógica de negocio:

```bash
# Correr todas las pruebas (Vitest)
npm run test

# Correr pruebas y generar reporte de cobertura (100% Coverage)
npm run test:coverage
```

## 🛣️ Próximos Pasos (Roadmap)
- [x] Implementar Swagger para documentación interactiva de la API (UI).
- [x] Configurar suite de pruebas con Vitest (Mocks & Integration Tests).
- [x] Implementar sistema de Autenticación robusto con JWT y Bcrypt.
- [x] Alcanzar 100% de Cobertura de Código (Test Coverage).
- [x] Implementar Vitest UI para visualización interactiva de tests en el navegador (`npm run test:ui`).
- [ ] Implementar Role-Based Access Control (RBAC) para proteger la creación/edición de productos (Solo ADMIN).