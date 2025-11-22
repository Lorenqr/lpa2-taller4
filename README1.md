# Music App Frontend 🎵

Aplicación frontend moderna para gestión de música, construida con SvelteKit 5 y Tailwind CSS 4.

## ✨ Características

- **Autenticación simple**: Login/Registro solo con email
- **Búsqueda avanzada**: Filtra canciones por título, artista y género
- **Sistema de favoritos**: Guarda tus canciones preferidas
- **Diseño responsivo**: Funciona perfectamente en móvil y escritorio
- **Tema oscuro minimalista**: Inspirado en aplicaciones musicales modernas
- **Validación en tiempo real**: Feedback inmediato en formularios
- **Estados de carga claros**: Indicadores visuales en todas las operaciones

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+ instalado
- Tu API de música corriendo en `http://localhost:8000`

### Instalación y Ejecución

\`\`\`bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# O abrir automáticamente en el navegador
npm run dev -- --open
\`\`\`

La aplicación estará disponible en `http://localhost:5174`

## 🔌 Integración con API

La aplicación se conecta automáticamente a tu API en `http://localhost:8000`. 

**⚠️ Importante**: Asegúrate de que tu API esté corriendo antes de iniciar la aplicación frontend.

### Endpoints utilizados:

**Usuarios:**
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios` - Listar usuarios

**Canciones:**
- `GET /api/canciones` - Listar canciones
- `GET /api/canciones/buscar?titulo={}&artista={}&genero={}` - Buscar canciones

**Favoritos:**
- `GET /api/usuarios/{id}/favoritos` - Obtener favoritos del usuario
- `POST /api/usuarios/{id}/favoritos/{cancion_id}` - Marcar favorito
- `DELETE /api/usuarios/{id}/favoritos/{cancion_id}` - Quitar favorito

## 📁 Estructura del Proyecto

\`\`\`
src/
├── lib/
│   ├── api.ts                      # Cliente API con manejo de errores robusto
│   ├── stores/
│   │   └── auth.ts                # Store de autenticación con Svelte stores
│   └── components/
│       ├── login-form.svelte       # Formulario de login/registro
│       ├── song-search.svelte      # Búsqueda de canciones con filtros
│       ├── favorites-list.svelte   # Lista de canciones favoritas
│       ├── main-app.svelte         # Layout principal con navegación
│       └── ui/                     # Componentes UI (shadcn-svelte)
│           ├── button/
│           ├── input/
│           ├── label/
│           ├── card/
│           └── ...
└── routes/
    ├── +layout.svelte             # Layout raíz
    └── +page.svelte               # Página principal (login o app)
\`\`\`

## 🎨 Tecnologías

- **SvelteKit 5** - Framework web moderno con runes ($state, $derived, $effect)
- **Tailwind CSS 4** - Estilos utilitarios de última generación
- **shadcn-svelte** - Componentes UI accesibles y personalizables
- **bits-ui** - Primitivas de UI headless
- **lucide-svelte** - Iconos SVG modernos
- **TypeScript** - Tipado estático para mayor seguridad

## 🛠️ Scripts Disponibles

\`\`\`bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build de producción optimizado
npm run preview      # Preview del build de producción
npm run check        # Verificar tipos TypeScript y errores de Svelte
npm run check:watch  # Verificación continua de tipos
\`\`\`

## 💡 Funcionalidades Destacadas

### Autenticación
- Detección automática de usuarios existentes por email
- Creación de cuenta en el momento si el usuario no existe
- Validación de email en tiempo real
- Mensajes de éxito y error claros

### Búsqueda de Canciones
- Búsqueda por título, artista o género
- Búsqueda combinada con múltiples filtros
- Carga inicial de canciones populares
- Paginación automática

### Sistema de Favoritos
- Agregar/quitar favoritos con un clic
- Indicador visual de canciones favoritas
- Vista dedicada para favoritos
- Sincronización instantánea con el servidor

## 🎯 Flujo de Usuario

1. **Login**: Usuario ingresa su email
   - Si existe → Login automático
   - Si no existe → Se solicita nombre y se crea cuenta

2. **Búsqueda**: Usuario busca canciones
   - Aplica filtros opcionales
   - Ve resultados en tarjetas interactivas
   - Marca favoritos con el botón de corazón

3. **Favoritos**: Usuario accede a sus favoritos
   - Ve lista completa de canciones guardadas
   - Puede remover favoritos
   - Estadísticas de canciones guardadas

## 🔧 Configuración

### Cambiar URL de API

Edita `src/lib/api.ts`:

\`\`\`typescript
const API_BASE_URL = 'http://localhost:8000'; // Cambia aquí
\`\`\`

### Personalizar Tema

Edita `src/app.css` para modificar los colores del tema:

\`\`\`css
:root {
  --primary: hsl(142 76% 36%);  /* Color primario (verde) */
  --background: hsl(240 10% 3.9%);  /* Fondo oscuro */
  /* ... más variables */
}
\`\`\`

## 📝 Notas Técnicas

- **Svelte 5 Runes**: La app usa la nueva sintaxis de Svelte 5 con `$state`, `$derived` y `$effect`
- **Manejo de Errores**: Todos los errores de API son capturados y mostrados al usuario
- **Validaciones**: Validación de email en tiempo real usando regex
- **Estado Global**: Autenticación manejada con Svelte stores
- **Sesión**: La sesión se mantiene en memoria (se pierde al recargar la página)

## 🚀 Próximos Pasos para Producción

- [ ] Implementar persistencia de sesión con localStorage o cookies
- [ ] Agregar tokens JWT para autenticación segura
- [ ] Implementar refresh tokens
- [ ] Agregar soporte para OAuth (Google, GitHub, etc.)
- [ ] Implementar tests unitarios y de integración
- [ ] Agregar modo claro/oscuro toggle
- [ ] Implementar reproducción de música (si aplica)
- [ ] Agregar paginación infinita o virtual scroll

## 🐛 Solución de Problemas

### Error de conexión con API
- Verifica que la API esté corriendo en `http://localhost:8000`
- Revisa que CORS esté habilitado en la API
- Verifica la consola del navegador para errores específicos

### Componentes no se cargan
- Ejecuta `npm install` para instalar dependencias
- Verifica que Node.js versión 18+ esté instalado
- Limpia caché: `rm -rf node_modules .svelte-kit && npm install`

## 📄 Licencia

Este proyecto es para fines educativos y de desarrollo.
