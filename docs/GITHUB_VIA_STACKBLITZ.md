# Subir el proyecto a GitHub usando StackBlitz (sin usar la terminal/Git local)

Esta alternativa reemplaza el Paso 1 de `docs/DEPLOYMENT_GUIDE.md` ("Subir
el código a GitHub"). El resto de la guía (Supabase, Vercel, etc.) sigue
igual desde el Paso 2.

## 1. Descomprime el proyecto
Descomprime `sell-in-reconoce.zip` en tu computador. Debes quedar con una
carpeta `sell-in-reconoce/` con todos los archivos adentro (no una carpeta
que contenga otra carpeta zip).

## 2. Entra a StackBlitz e inicia sesión con GitHub
1. Ve a [stackblitz.com](https://stackblitz.com).
2. Haz clic en "Sign in" y elige **Continuar con GitHub**. Esto autoriza a
   StackBlitz a crear repositorios en tu cuenta.

## 3. Crea un proyecto nuevo subiendo la carpeta
1. En el dashboard de StackBlitz, busca la opción de crear un proyecto
   nuevo ("New Project" / "+").
2. Arrastra la carpeta `sell-in-reconoce` completa directamente sobre la
   ventana del navegador (drag & drop), o usa la opción "Import Folder" si
   la ves disponible.
3. StackBlitz detectará el `package.json` y abrirá el proyecto en el
   editor.

**Nota importante**: este proyecto usa Supabase/Postgres, que StackBlitz
no puede correr dentro del navegador (no soporta bases de datos con
proceso propio). Es normal si `npm run dev` no levanta completo ahí dentro
— no es un problema del código, es una limitación de StackBlitz. El
objetivo de este paso es solo **subir el código a GitHub**, no ejecutarlo
en StackBlitz.

## 4. Conecta y crea el repositorio en GitHub
1. En el editor de StackBlitz (Classic Editor), busca el botón
   **"Connect Repository"** (esquina superior izquierda, junto al nombre
   del proyecto).
2. Elige **"Create repo and push"**.
3. Define:
   - Nombre del repositorio (ej. `sell-in-reconoce`)
   - Visibilidad: **Privado** (recomendado, ya que es código interno de
     Falabella)
4. Confirma. StackBlitz crea el repositorio en tu cuenta de GitHub y sube
   todos los archivos automáticamente — equivalente a haber hecho
   `git init`, `git add`, `git commit` y `git push` a mano.

## 5. Verifica en GitHub
Entra a `github.com/TU-USUARIO/sell-in-reconoce` y confirma que todos los
archivos estén ahí (carpetas `app/`, `supabase/`, `docs/`, etc.).

## 6. Si necesitas hacer cambios después
- Puedes seguir editando en StackBlitz y el mismo botón (ahora dirá algo
  como "Push" o mostrará el estado de sincronización) te permite subir
  nuevos cambios como commits nuevos.
- Para cambios más grandes o si prefieres trabajar con un editor de
  código real, te recomendamos clonar el repo ya creado en tu computador
  (`git clone https://github.com/TU-USUARIO/sell-in-reconoce.git`) y
  seguir trabajando ahí — StackBlitz ya cumplió su función de "puente"
  inicial hacia GitHub.

## 7. Continúa con el despliegue
Desde aquí, sigue `docs/DEPLOYMENT_GUIDE.md` **desde el Paso 2** (Crear el
proyecto en Supabase) — Vercel se conecta directo a este repositorio de
GitHub igual que si lo hubieras subido por línea de comandos.

## Si "Connect Repository" no aparece o falla
- Confirma que iniciaste sesión con GitHub (no con email).
- Revisa en `github.com/settings/applications` que StackBlitz esté
  autorizado como OAuth App.
- Como alternativa, StackBlitz también ofrece el editor **Codeflow**
  (`pr.new` o el editor con ícono de VS Code), que tiene una terminal real
  con `git` — puedes usar `git push` manualmente ahí si el botón de la
  versión Classic da problemas.
