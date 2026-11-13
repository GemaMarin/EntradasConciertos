# Primera Fila 🎟️

App (web instalable / PWA) para seguir a tus grupos favoritos y **no perderte nunca el día en que salen las entradas** de sus conciertos en tu ciudad (o varias).

## Qué hace ya (fase 1)

- **Bienvenida**: nombre, ciudades y búsqueda de artistas en el catálogo completo de Deezer (cualquier artista; si no aparece, se puede seguir por nombre). Spotify: próximamente.
- **Inicio**: aviso destacado si hoy salen entradas, carrusel *Salen a la venta* con cuenta atrás, conciertos ya a la venta y tus conciertos.
- **Calendario** mensual con conciertos (rosa) y salidas a la venta (amarillo), filtro y agenda.
- **Artistas**: seguir / dejar de seguir, con su próxima venta.
- **Ficha de concierto** (hoja deslizable): fechas de preventa y venta general, "Me interesa" / "Tengo entrada", compartir y **añadir aviso al calendario** (.ics con alarma el día antes y 15 min antes).
- Los datos del usuario se guardan en el propio dispositivo (todavía no hay cuentas).

> ⚠️ Mientras no haya clave de Ticketmaster, los conciertos son **datos de ejemplo** (marcados como *Demo*).

## Parte social (cuentas, amigos)

- Registro con Google, perfil con @usuario (público o privado), seguir a gente tipo Instagram.
- «Me interesa» / «Tengo entrada» se guardan en tu cuenta; en **Amigos** ves los planes de la gente que sigues y en cada concierto **quién va**.
- Funciona con [Supabase](https://supabase.com) (gratis). Sin configurarlo, la app sigue funcionando en modo local.

Configuración:
1. Vercel → proyecto → **Storage** → *Create Database* → **Supabase** → conectar al proyecto (crea `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Supabase → **SQL Editor** → pegar `supabase/schema.sql` → *Run*.
3. Google Cloud Console → credencial OAuth (Web) con la URI de redirección `https://<proyecto>.supabase.co/auth/v1/callback`; Supabase → Authentication → Providers → **Google** → pegar Client ID y Secret.
4. Supabase → Authentication → URL Configuration → *Site URL* = tu URL de Vercel y en *Redirect URLs* añadir `https://*.vercel.app/**`.

## Arrancar en local

```bash
npm install
npm run dev   # http://localhost:3000
```

## Datos reales (Ticketmaster)

1. Crea una cuenta gratuita en https://developer.ticketmaster.com y copia tu *Consumer Key*.
2. Crea `.env.local` con:
   ```
   TICKETMASTER_API_KEY=tu_clave
   ```
3. Con la clave activa, los conciertos se piden a la Discovery API filtrando por tus ciudades, incluidas las fechas de preventa y venta general.

## Publicar

La forma más sencilla es [Vercel](https://vercel.com): importar este repositorio, añadir `TICKETMASTER_API_KEY` en *Environment Variables* y desplegar.

## Estructura

```
src/app/(main)/        Inicio, Calendario, Amigos, Artistas, Perfil, /u/[usuario]
src/app/bienvenida/    Onboarding
src/app/api/           /api/artists (búsqueda) y /api/events (conciertos)
src/components/        UI (tarjetas, hoja de detalle, navegación…)
supabase/schema.sql    tablas y permisos (Row Level Security)
src/lib/               tipos, Supabase (social.ts, sincronización), fechas (Europe/Madrid), datos demo, Ticketmaster, .ics, estado
```

## Próximas fases

1. Datos reales + actualización diaria + notificaciones push.
3. Conciertos a los que has ido, con fotos.
4. Descubrir artistas parecidos (Spotify / Last.fm).
