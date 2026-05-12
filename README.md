# Portal del Agremiado

Plataforma web white-label para la gestión digital de colegios profesionales. Permite a los agremiados pagar sus cuotas mensuales, inscribirse a eventos, reservar locales, leer comunicados, responder encuestas, registrar reclamos y mantener su perfil actualizado, todo bajo la identidad visual de cada colegio.

El portal forma parte de un ecosistema multi-tenant: un único frontend sirve a múltiples colegios profesionales, aplicando dinámicamente colores, logo y módulos habilitados según la configuración de cada organización.

---

## 🧩 Stack tecnológico

| Capa           | Tecnología                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Framework      | [Next.js 14](https://nextjs.org/) (App Router + RSC)                    |
| Lenguaje       | TypeScript (strict mode)                                                |
| Estilos        | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) + Radix UI           |
| Estado cliente | [Zustand](https://zustand-demo.pmnd.rs/) (persistido en `localStorage`) |
| Datos          | Apollo Client (GraphQL, `cache-and-network`)                            |
| Formularios    | React Hook Form + Zod                                                   |
| Pagos          | iziPay (formulario embebido)                                            |
| Auth           | JWT en cookies, refresh automático                                      |
| Notificaciones | Sonner (toasts)                                                         |
| Fechas         | date-fns (locale `es`)                                                  |
| Editor         | Contenido TipTap renderizado (HTML)                                     |
| Deploy         | Vercel                                                                  |

---

## ✅ Prerrequisitos

- **Node.js** ≥ 18.17
- **npm**, **yarn** o **pnpm**
- Acceso al backend GraphQL del portal (proporcionado por el equipo)
- Credenciales de iziPay (modo sandbox o producción)

---

## ⚙️ Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd portal_agremiado

# 2. Instalar dependencias
yarn install
# o npm install

# 3. Crear el archivo .env (ver siguiente sección)
cp .env.example .env

# 4. Levantar el servidor de desarrollo
yarn dev
```

El portal queda disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔐 Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# URL base del backend GraphQL
NEXT_PUBLIC_URL_SERVER=http://localhost:3001

# Endpoint IPN (notificación push) de iziPay
NEXT_PUBLIC_URL_SERVER_IPN=http://localhost:3001/izipay/ipn
```

| Variable                     | Descripción                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_URL_SERVER`     | URL del servidor backend que expone el endpoint GraphQL `/graphql` y los recursos de la organización. |
| `NEXT_PUBLIC_URL_SERVER_IPN` | URL pública del endpoint que recibe las notificaciones IPN de iziPay tras un pago exitoso.            |

> ⚠️ Ambas variables deben ser **públicas** (`NEXT_PUBLIC_*`) porque se consumen desde el cliente al inicializar Apollo y al construir el payload de iziPay.

---

## 📜 Comandos

```bash
yarn dev      # Servidor de desarrollo (puerto 3000)
yarn build    # Build de producción
yarn start    # Servir el build de producción
yarn lint     # Linter (ESLint + next/core-web-vitals)
```

---

## 📁 Estructura de carpetas

```
portal_agremiado/
├── app/                          # App Router (Next.js 14)
│   ├── (auhtorization)/          # Rutas públicas de autenticación
│   │   └── sign-in, sign-up, recover-password
│   ├── (private)/                # Rutas protegidas (requieren JWT)
│   │   ├── page.tsx              # Dashboard personal
│   │   ├── layout.tsx            # Shell autenticado (sidebar, topbar)
│   │   ├── actividades/          # Catálogo de eventos sociales/académicos
│   │   ├── anuncios/             # Comunicados y noticias
│   │   ├── calendario/           # Vista de calendario
│   │   ├── checkout/             # Pago de cuotas con iziPay
│   │   ├── comunicados/          # Detalle de comunicados (TipTap)
│   │   ├── convenios/            # Catálogo y detalle de convenios
│   │   ├── encuestas/            # Encuestas (única, múltiple, texto, escala)
│   │   ├── espacios/             # Locales reservables (galería + solicitud)
│   │   ├── mis-reservas/         # Historial de reservas del usuario
│   │   ├── update-data/          # Edición de perfil
│   │   └── components/           # Componentes específicos del área privada
│   ├── (public)/                 # Páginas públicas (landing, etc.)
│   ├── globals.css               # Variables CSS y estilos base
│   ├── layout.tsx                # Root layout (providers, fonts, theming)
│   └── favicon.ico
│
├── components/                   # Componentes compartidos
│   ├── ui/                       # shadcn/ui (Button, Card, Dialog, etc.)
│   ├── home/                     # Bloques del dashboard
│   ├── ClientProviders.tsx       # Composición de providers cliente
│   ├── DynamicHead.tsx           # <head> con favicon/título dinámicos
│   ├── AppLoader.tsx             # Splash screen mientras carga la org
│   ├── Logo.tsx                  # Logo dinámico de la organización
│   ├── Footer.tsx, NotificationBell.tsx, ...
│
├── graphql/
│   ├── apollo.client.ts          # Cliente Apollo + auth link + refresh token
│   ├── query/                    # Queries GraphQL (.ts)
│   └── mutation/                 # Mutations GraphQL (.ts)
│
├── providers/
│   ├── organization-provider.tsx # Branding, colores, módulos habilitados
│   └── user-provider.tsx         # Bootstrap del store de usuario
│
├── stores/
│   └── user-store.ts             # Zustand: usuario actual (persist)
│
├── lib/
│   ├── apollo.client.ts          # (helpers Apollo)
│   ├── cookies.ts                # Lectura/escritura de JWT en cookies
│   ├── izipay.ts                 # SDK iziPay: orderId, transactionId, payload
│   ├── routes.ts                 # Constantes de rutas
│   ├── zod.ts                    # Schemas de validación compartidos
│   ├── calendar.ts               # Utilidades para react-big-calendar
│   └── utils.ts                  # cn(), formatters, helpers
│
├── types/                        # Tipados de dominio (auth, agreements,
│                                 # surveys, orders, izipay, etc.)
├── utils/
│   ├── enum.ts                   # UserRoles, UserStatus, EventTypes...
│   ├── resources.ts              # Etiquetas y textos
│   └── terms.ts                  # Términos y condiciones
│
├── public/                       # Assets estáticos
├── middleware.ts                 # Middleware Next.js (guards de rutas)
├── tailwind.config.ts            # Tokens custom (primary, accent, ...)
├── components.json               # Configuración shadcn/ui
├── next.config.mjs
└── tsconfig.json                 # Path alias `@/*` → raíz del proyecto
```

---

## 🧱 Módulos del portal

| Módulo                | Descripción                                                                    | Feature flag         |
| --------------------- | ------------------------------------------------------------------------------ | -------------------- |
| 🔐 **Autenticación**  | Login, registro (DNI / nombre / correo), recuperación de contraseña            | siempre activo       |
| 🏠 **Dashboard**      | Resumen de cuotas pendientes, próximos eventos y comunicados recientes         | siempre activo       |
| 💳 **Pago de cuotas** | Selección de periodos, pago vía iziPay, historial y descarga de comprobantes   | `moduleQuotes`       |
| 🎟️ **Eventos**        | Catálogo con filtros (social / académico), inscripción y registro de invitados | `moduleEvents`       |
| 📰 **Comunicados**    | Lectura de noticias con contenido TipTap renderizado                           | `modulePosts`        |
| 🤝 **Convenios**      | Listado y detalle de convenios institucionales                                 | `moduleAgreements`   |
| 📊 **Encuestas**      | Respuesta de encuestas (opción única, múltiple, texto, escala)                 | `moduleSurveys`      |
| 🛟 **Soporte**        | Registrar reclamos y consultar su estado                                       | siempre activo       |
| 🏛️ **Locales**        | Catálogo con galería de imágenes y solicitud de reserva                        | `moduleReservations` |
| 👤 **Perfil**         | Edición de datos personales y foto de perfil                                   | siempre activo       |

Los flags se exponen vía el `OrganizationProvider` y se consultan para condicionar la navegación y el renderizado de cada sección.

---

## 🎨 Theming dinámico (white-label)

El portal **no** tiene una paleta fija: cada colegio profesional define sus propios colores, logo y favicon, que se cargan al inicializar la sesión y se aplican como variables CSS. Esto permite que la misma base de código sirva a N organizaciones manteniendo su identidad visual.

### Flujo

1. **Carga server-side**
   El `OrganizationProvider` consulta vía GraphQL la configuración de la organización (basada en el dominio o en el slug). La respuesta incluye:

   ```ts
   {
     name: string;
     logoUrl: string;
     faviconUrl: string;
     primaryColor: string; // hex, ej. "#0D47A1"
     accentColor: string; // hex, ej. "#FFC107"
     moduleEvents: boolean;
     moduleReservations: boolean;
     moduleSurveys: boolean;
     moduleAgreements: boolean;
     moduleQuotes: boolean;
     modulePosts: boolean;
     // ...
   }
   ```

   La query se cachea con `revalidate: 300` (5 min).

2. **Conversión hex → HSL**
   Los colores se transforman a HSL para que Tailwind/shadcn puedan combinarlos con sus utilidades de opacidad (`bg-primary/50`, etc.).

3. **Inyección de variables CSS**
   Se escriben directamente en `:root`:

   ```css
   :root {
     --primary: 210 79% 34%;
     --primary-light: 210 79% 92%;
     --accent: 45 100% 51%;
     --accent-hover: 45 100% 45%;
   }
   ```

4. **Anti-FOUC**
   En el `<head>` de `app/layout.tsx` se inyecta un script inline que lee la última configuración desde `localStorage` y aplica las variables **antes del primer paint**, evitando que el usuario vea el tema por defecto antes de que cargue el real.

5. **Mapeo en Tailwind**
   `tailwind.config.ts` mapea los tokens custom a esas variables:

   ```ts
   colors: {
     primary:        "hsl(var(--primary))",
     "primary-light":"hsl(var(--primary-light))",
     accent:         "hsl(var(--accent))",
     "accent-hover": "hsl(var(--accent-hover))",
   }
   ```

6. **Logo y favicon**
   `<Logo />` consume `logoUrl` desde el contexto y `<DynamicHead />` actualiza el `<link rel="icon">` y el `<title>` en runtime.

> 💡 Para añadir un nuevo color global basta con: definir el campo en el backend, exponerlo en el provider, agregar la variable en `globals.css` y mapearla en `tailwind.config.ts`.

---

## 🚀 Despliegue en Vercel

El proyecto está optimizado para Vercel y se despliega sin configuración adicional.

### Pasos

1. **Importar el repositorio** desde el dashboard de Vercel.
2. Vercel detecta automáticamente Next.js 14 (no requiere `Build Command` ni `Output Directory` custom).
3. **Configurar las variables de entorno** en _Settings → Environment Variables_:
   - `NEXT_PUBLIC_URL_SERVER`
   - `NEXT_PUBLIC_URL_SERVER_IPN`

   Definirlas para los entornos `Production`, `Preview` y `Development` (típicamente apuntando a backends distintos por entorno).

4. **Dominios**: asignar el dominio del colegio (o un subdominio por organización) en _Settings → Domains_. El backend identifica la organización a partir del host de la request.
5. **Deploy**: cada push a `main` genera un deploy de producción; cualquier otra rama o PR genera un _Preview Deployment_.

### Recomendaciones

- Habilitar **Vercel Analytics** para métricas de Core Web Vitals.
- Configurar el endpoint IPN de iziPay apuntando al backend de **producción** (no a la URL de Vercel del frontend).
- Si se usa multi-tenant por dominio, agregar todos los dominios de los colegios al mismo proyecto Vercel.

---

## 📄 Licencia

**Proprietary** — Todos los derechos reservados.

Este software es propiedad de su titular y se distribuye bajo licencia privada. Está prohibida su copia, modificación, redistribución o uso comercial sin autorización expresa y por escrito del propietario.
