# Despliegue en AWS Amplify Hosting

Esta aplicación se despliega como Next.js en Amplify Hosting Compute. No se usa `next export`: el artefacto es `.next` para conservar las rutas dinámicas.

## Configuración en la consola

1. Crear una aplicación en Amplify Hosting y conectar el repositorio `sktvera/Demo-HM`.
2. Seleccionar la rama `master` y activar despliegues automáticos.
3. Indicar que la aplicación está en la raíz del repositorio; no marcarla como monorepo.
4. Confirmar que Amplify detecta Next.js y usa `amplify.yml`.
5. El output debe ser `.next` y la plataforma `WEB_COMPUTE`.

Para una aplicación de Amplify creada previamente como sitio estático (`WEB`), cambiarla a `WEB_COMPUTE` antes del siguiente despliegue.

## Variables

No se requiere `NEXT_PUBLIC_BASE_PATH` para el dominio raíz de Amplify. Déjela sin definir. Solo configúrela si la aplicación se servirá realmente bajo un subpath; debe tener formato `/subruta`.

No guardar secretos en variables `NEXT_PUBLIC_*`, en `amplify.yml` ni en el repositorio. Las variables públicas quedan incluidas en el bundle del navegador.

## Pipeline

Amplify ejecuta con Node.js 20 y pnpm 10:

1. Instalación reproducible con `pnpm install --frozen-lockfile`.
2. Typecheck.
3. Lint sin modificar archivos; bloquea errores. La deuda histórica de warnings se consulta con `pnpm lint:strict`.
4. Build de Next.js.
5. Publicación del directorio `.next`.

## Verificación posterior

- `/`
- `/admin/login`
- `/consultar-certificado`
- Abrir directamente y refrescar una ruta dinámica como `/cotizacion-digital/<token>`.
- Verificar assets, navegación, favicon y consola del navegador.
- Confirmar que el link copiado de cotización contiene el host/path correcto.

## Limitación vigente

El sistema todavía guarda sesión y datos en `localStorage`. Este despliegue es una demo y no debe manejar datos reales ni considerarse ERP productivo hasta implementar backend, base de datos y autorización en servidor.
