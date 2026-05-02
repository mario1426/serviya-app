# ServiYa — Guía de Setup Completo

## Stack
- **Frontend / Admin:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io
- **Base de datos:** MongoDB Atlas
- **Auth:** Firebase Authentication (Google)
- **Pagos:** Mercado Pago API
- **Deploy:** Vercel (frontend) + Render/Railway (backend)

---

## 1. Firebase (Auth)

1. Ir a https://console.firebase.google.com
2. **Crear nuevo proyecto** → nombre: `serviya`
3. En el menú lateral → **Authentication** → **Comenzar**
4. Habilitar proveedor: **Google**

### Para el Frontend:
5. Ir a **Configuración del proyecto** (ícono engranaje) → **Aplicaciones web** → **Agregar app**
6. Copiar el objeto `firebaseConfig` y pegar los valores en `frontend/.env`

### Para el Backend (Admin SDK):
7. Ir a **Configuración del proyecto** → **Cuentas de servicio**
8. Click en **Generar nueva clave privada** → descarga un JSON
9. Copiar los valores al `backend/.env`:
   - `FIREBASE_PROJECT_ID` = `project_id` del JSON
   - `FIREBASE_PRIVATE_KEY` = `private_key` del JSON
   - `FIREBASE_CLIENT_EMAIL` = `client_email` del JSON

---

## 2. MongoDB Atlas

1. Ir a https://cloud.mongodb.com → crear cuenta gratuita
2. **Create a deployment** → **M0 (Free)**
3. Elegir región: `São Paulo` (más cercana a Argentina)
4. **Create** → esperar que cree el cluster
5. En **Database Access** → **Add new database user** → guardar usuario y contraseña
6. En **Network Access** → **Add IP Address** → **Allow access from anywhere** (0.0.0.0/0)
7. En **Clusters** → **Connect** → **Drivers** → copiar connection string
8. Reemplazar `<username>` y `<password>` y pegar en `backend/.env` como `MONGODB_URI`

---

## 3. Mercado Pago

1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una aplicación en **Mis aplicaciones**
3. En **Credenciales** → copiar:
   - `Access Token` (empieza con `TEST-`) → `backend/.env` como `MP_ACCESS_TOKEN`
   - `Public Key` → `frontend/.env` como `VITE_MP_PUBLIC_KEY`

---

## 4. Instalación y ejecución local

```bash
# 1. Clonar / abrir el proyecto
cd "ServiYa App"

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Crear .env desde el ejemplo
cp .env.example .env
# → Editar .env con tus credenciales reales

# 4. Cargar las categorías iniciales (ejecutar UNA sola vez)
node src/utils/seedCategories.js

# 5. Iniciar el backend
npm run dev
# → Corre en http://localhost:5000

# 6. En otra terminal: instalar y correr el frontend
cd ../frontend
npm install
cp .env.example .env
# → Editar .env con tus claves de Firebase y MP
npm run dev
# → Corre en http://localhost:5173

# 7. En otra terminal: admin panel
cd ../admin-panel
npm install
cp .env.example .env
# → Mismo .env que el frontend
npm run dev
# → Corre en http://localhost:5174
```

---

## 5. Crear el primer usuario Admin

Después de registrarte en la app con Google, necesitás promoverte a admin manualmente en MongoDB:

1. Ir a **MongoDB Atlas** → **Browse Collections** → colección `users`
2. Encontrar tu usuario
3. Editar el campo `role` de `"client"` a `"admin"`
4. Guardar

Con eso ya podés acceder al panel en `http://localhost:5174`

---

## 6. Estructura del proyecto

```
ServiYa App/
├── backend/               ← API REST + WebSocket
│   ├── src/
│   │   ├── config/        ← Firebase, MongoDB
│   │   ├── controllers/   ← Lógica de negocio
│   │   ├── middleware/     ← Auth, errores
│   │   ├── models/        ← Schemas MongoDB
│   │   ├── routes/        ← Endpoints
│   │   └── utils/         ← Seed de datos
│   └── .env.example
│
├── frontend/              ← App del cliente y trabajador
│   └── src/
│       ├── context/       ← Auth global
│       ├── hooks/         ← useGeolocation
│       ├── pages/
│       │   ├── client/    ← Home, Workers, Request, Chat...
│       │   └── worker/    ← Dashboard, Requests, Profile...
│       └── services/      ← Axios con Firebase token
│
└── admin-panel/           ← Panel de administración
    └── src/
        └── pages/         ← Dashboard, Users, Verifications...
```

---

## 7. Endpoints principales del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro inicial con Firebase token |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/users/workers` | Trabajadores cercanos (lat, lng, category) |
| GET | `/api/users/workers/:id` | Perfil de un trabajador |
| PUT | `/api/users/profile` | Actualizar perfil |
| PUT | `/api/users/availability` | Toggle disponibilidad (worker) |
| POST | `/api/requests` | Crear solicitud de servicio |
| GET | `/api/requests/my` | Mis solicitudes (cliente) |
| GET | `/api/requests/incoming` | Solicitudes entrantes (trabajador) |
| PUT | `/api/requests/:id/accept` | Aceptar solicitud |
| PUT | `/api/requests/:id/complete` | Completar servicio |
| POST | `/api/payments/create-preference` | Crear pago MP |
| POST | `/api/reviews` | Calificar servicio |
| GET | `/api/categories` | Listado de categorías |

---

## 8. Deploy

### Backend (Render)
1. Crear cuenta en https://render.com
2. New → Web Service → conectar tu repo de GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Agregar todas las variables del `.env` en **Environment**

### Frontend / Admin (Vercel)
1. Crear cuenta en https://vercel.com
2. Import Project → conectar repo
3. Framework: Vite
4. Root Directory: `frontend` (o `admin-panel`)
5. Agregar variables de entorno en **Settings → Environment Variables**

---

## Funcionalidades del MVP

- [x] Login con Google (Firebase)
- [x] Elección de rol (cliente / trabajador)
- [x] Perfil del cliente y trabajador
- [x] Búsqueda de trabajadores por categoría y geolocalización
- [x] Perfil público del trabajador con reseñas
- [x] Solicitud de servicio (precio fijo o presupuesto)
- [x] Servicio urgente con recargo
- [x] Flujo completo: pendiente → aceptado → en curso → completado
- [x] Chat en tiempo real (Socket.io)
- [x] Pago con Mercado Pago
- [x] Calificación de 1 a 5 estrellas
- [x] Historial de servicios
- [x] Verificación de identidad (DNI + selfie)
- [x] Toggle de disponibilidad del trabajador
- [x] Panel de admin con: stats, usuarios, verificaciones, servicios/precios, tickets
- [x] Mensaje "no hay trabajadores en tu zona"
- [x] Comisión configurable (default 20%)
