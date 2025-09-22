# Funciones Globales - Reglas de Uso

## ⚠️ IMPORTANTE: Funciones Globales en Window

Este proyecto utiliza funciones globales en `window` para comunicación entre componentes. Es **CRÍTICO** seguir estas reglas para evitar bugs de navegación.

## 📋 Funciones Globales Actuales

### `openProfileModal()`
- **Propietario**: `src/app/layout.tsx` (Root Layout)
- **Propósito**: Navegar al perfil del usuario
- **Ubicación**: `(window as any).openProfileModal`

### `closeProfileModal()`
- **Propietario**: `src/components/TwitterLikeLayout.tsx`
- **Propósito**: Cerrar el modal de perfil (solo en home)
- **Ubicación**: `(window as any).closeProfileModal`

## 🚨 REGLAS CRÍTICAS

### ❌ NUNCA HAGAS ESTO:
```typescript
// En ANY componente que NO sea el root layout
return () => {
  delete (window as any).openProfileModal // ❌ NUNCA!
}
```

### ✅ SIEMPRE HAZ ESTO:
```typescript
// Solo en el root layout (src/app/layout.tsx)
return () => {
  delete (window as any).openProfileModal // ✅ Solo aquí
}

// En otros layouts/componentes
return () => {
  // CRITICAL: NEVER delete openProfileModal - it's owned by the root layout!
  delete (window as any).closeProfileModal // ✅ Solo tu propia función
}
```

## 🔍 Cómo Verificar

```bash
# Buscar todos los lugares donde se elimina openProfileModal
grep -r "delete.*openProfileModal" src/

# Resultado esperado: SOLO debe aparecer en src/app/layout.tsx
```

## 🐛 Síntomas de Violación

Si rompes estas reglas, verás:
- ✅ Home → Mi Perfil = Funciona
- ❌ Popular → Mi Perfil = No funciona
- ❌ Feed → Mi Perfil = No funciona

## 💡 Por Qué Existen Estas Reglas

1. **Root Layout**: Se monta UNA vez al cargar la app
2. **Otros Layouts**: Se montan/desmontan al navegar
3. **Problema**: Si un layout hijo elimina una función global, se pierde para siempre
4. **Solución**: Solo el propietario puede eliminar su función

## 🛠️ Al Agregar Nuevos Layouts

```typescript
// ✅ Patrón correcto para nuevos layouts
useEffect(() => {
  // Crear solo TUS funciones específicas
  (window as any).miNuevaFuncion = () => { /* ... */ }
  
  return () => {
    // Solo eliminar TUS funciones
    delete (window as any).miNuevaFuncion
    // NEVER: delete (window as any).openProfileModal
  }
}, [])
```

## 🚫 Rutas sin Sidebar

Algunas rutas están configuradas para NO mostrar el sidebar:

```typescript
// En src/app/layout.tsx
const sidebarHiddenRoutes = ['/events']
const shouldHideSidebar = sidebarHiddenRoutes.some(route => pathname.startsWith(route))
```

### Para Agregar Nuevas Rutas sin Sidebar:
```typescript
const sidebarHiddenRoutes = [
  '/events',          // ✅ Página de eventos
  '/evento',          // Ejemplo: páginas individuales de evento
  '/checkout'         // Ejemplo: proceso de pago
]
```

---

**Última actualización**: Después de resolver el bug de navegación de perfil y configurar rutas sin sidebar en Diciembre 2024.