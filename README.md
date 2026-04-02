# 📦 E-Commerce Inventory API (Fastify + Prisma + Zod)

Una API RESTful de nivel de producción para la gestión de inventario de un E-commerce. Este proyecto demuestra la implementación de buenas prácticas de desarrollo backend, arquitectura limpia y seguridad por diseño utilizando el ecosistema moderno de Node.js.

## 🚀 Tecnologías Principales

* **Framework Web:** [Fastify](https://www.fastify.io/) - Elegido por su altísimo rendimiento y bajo overhead.
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estático para código predecible.
* **ORM:** [Prisma v5](https://www.prisma.io/) - Gestión de base de datos tipada de extremo a extremo.
* **Base de Datos:** PostgreSQL alojado en [Supabase](https://supabase.com/).
* **Validación:** [Zod](https://zod.dev/) + `fastify-type-provider-zod` - Validación de esquemas en tiempo de ejecución y tipado inferido.

## 🧠 Decisiones de Arquitectura Destacadas

1. **Validación en la "Frontera":** Uso estricto de Zod inyectado en las opciones de las rutas de Fastify. Ninguna petición mal formada llega a la capa de servicios o a la base de datos.
2. **Manejador Global de Errores (Error Handler):** Centralización de los errores. Los códigos de Prisma (ej. `P2002` de duplicados o `P2025` de no encontrados) y los errores de validación se interceptan y formatean en respuestas HTTP limpias (`400`, `404`, `409`), evitando filtrar información sensible al cliente (`500`).
3. **Soft Delete (Borrado Lógico):** Los productos no se eliminan físicamente de la base de datos para mantener la integridad referencial y el historial; en su lugar, se actualiza una bandera `isActive`.
4. **Clean Architecture:** Separación clara de responsabilidades en capas lógicas (`Routes`, `Controllers/Services`, `Schemas`, `Plugins`).

## 📁 Estructura del Proyecto

```text
src/
 ├── plugins/          # Plugins de Fastify (Manejador de errores global)
 ├── routes/           # Definición de endpoints HTTP y asociación de esquemas Zod
 ├── services/         # Lógica de negocio pura e interacciones con Prisma
 ├── schemas/          # Esquemas de validación (Zod)
 └── app.ts            # Punto de entrada y configuración del servidor Fastify
prisma/
 └── schema.prisma     # Modelado de datos y configuración del ORM
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

## 📡 Endpoints de la API (Referencia Rápida)

| Método | Endpoint | Descripción | Body (Ejemplo) |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Lista todos los productos activos (`isActive: true`). | - |
| **POST** | `/api/products` | Crea un nuevo producto. | `{"name": "Mouse", "sku": "MOUSE001", "price": 25, "stock": 50}` |
| **PUT** | `/api/products/:id` | Actualiza un producto existente (Campos opcionales). | `{"price": 30}` |
| **DELETE**| `/api/products/:id` | Realiza un Soft Delete (Desactiva el producto). | - |

*(Nota: Todos los endpoints cuentan con validación estricta. Si se envía un SKU menor a 8 caracteres, o un precio negativo, la API retornará un `400 Bad Request` automático).*

## 🛣️ Próximos Pasos (Roadmap)
- [ ] Implementar Swagger para documentación interactiva de la API (UI).
- [ ] Implementar sistema de Autenticación con JWT (JSON Web Tokens).
- [ ] Implementar Role-Based Access Control (RBAC) para proteger la creación/edición de productos.