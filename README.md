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
src/app/(main)/        Inicio, Calendario, Artistas (con barra inferior)
src/app/bienvenida/    Onboarding
src/app/api/           /api/artists (búsqueda) y /api/events (conciertos)
src/components/        UI (tarjetas, hoja de detalle, navegación…)
src/lib/               tipos, fechas (Europe/Madrid), datos demo, Ticketmaster, .ics, estado
```

## Próximas fases

1. Datos reales + actualización diaria + notificaciones push.
2. Cuentas, amigos y "a qué conciertos van tus amigos".
3. Conciertos a los que has ido, con fotos.
4. Descubrir artistas parecidos (Spotify / Last.fm).
