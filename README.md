# Sounds of Growth

Plataforma para docentes de música y sus alumnos (Next.js App Router + TypeScript + Prisma + NextAuth).

## Requisitos
- Node.js 20+
- npm 10+

## Variables de entorno
Copia `.env.local` (ya creada) o crea una nueva con, por ejemplo:

```
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=RELLENAR_O_DEJAR_EL_EXISTENTE
NEXTAUTH_URL=http://localhost:3000

# Seed SUPER ADMIN
SEED_SUPER_ADMIN_EMAIL=admin@example.com
SEED_SUPER_ADMIN_PASSWORD=ChangeMeStrong!123
SEED_SUPER_ADMIN_FIRST_NAME=Super
SEED_SUPER_ADMIN_LAST_NAME=Admin
SEED_SUPER_ADMIN_LOCALE=en

# SMTP (opcional para magic link)
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=EMAIL_SERVER_PASSWORD=
EMAIL_FROM=no-reply@soundsofgrowth.com
```

## Instalación
```
npm install
```

## Primer uso (migración y seed)
Terminal A:
```
# Generar cliente Prisma
npm run prisma:generate
# Crear/actualizar esquema en SQLite
npm run prisma:push
# Seed SUPER ADMIN (usa .env.local)
npm run db:seed
```

## Desarrollo (multi terminal)
Terminal A — servidor web:
```
npm run dev
```
- URL: http://localhost:3000

Terminal B — Prisma Studio (opcional):
```
npx prisma studio
```
- URL: http://localhost:5555

Terminal C — Linter en watch (opcional):
```
npm run lint
```

## Acceso
- Login: http://localhost:3000/login
- SUPER ADMIN (seed): `admin@example.com` / `ChangeMeStrong!123`
- Panel Super Admin: `/super-admin`
- Panel Docente: `/teacher`

## Flujo actual
- Super Admin: crea docentes (`/super-admin/teachers/new`).
- Docente: crea alumnos (`/teacher/students/new`).
- Idioma por usuario: `locale` (`en`/`es`). Selector de idioma superficial en navbar (cookie `locale`).

## Magic link (opcional)
Configura variables `EMAIL_*` y el provider Email se habilitará. Sin SMTP, el botón de magic link no enviará correos.

## Build de producción
```
npm run build
npm start
```

## Tech stack
- Next.js (App Router), TypeScript
- Prisma ORM (SQLite dev; Postgres recomendado para prod)
- NextAuth (credenciales + email provider opcional)
- TailwindCSS + shadcn/ui
- Zod, ESLint

## Scripts útiles
- `npm run prisma:generate` — Genera Prisma Client
- `npm run prisma:push` — Aplica esquema al DB de dev
- `npm run db:seed` — Crea SUPER ADMIN
- `npm run build` — Build producción
- `npm run start` — Arranca build
