# NFTicket - Web3 Event Ticketing Platform

NFTicket es una plataforma de venta de tickets con soporte para NFTs, construida con un enfoque modular y escalable.

## 🏗️ Arquitectura del Monorepo

```
Alpha_NFticket/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo React Native app (placeholder)
├── packages/
│   ├── api/          # Business logic and feature flags
│   ├── blockchain/   # NFT infrastructure (desacoplada)
│   ├── cache/        # Caching system (memory/Redis)
│   ├── i18n/         # Internationalization
│   └── ui/           # Shared components
└── docs/            # Documentation and ADRs
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- pnpm 8+

### Instalación y Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo web
pnpm dev

# Ejecutar tests
pnpm test

# Build completo
pnpm build
```

## ⚡ Feature Flags

El sistema utiliza feature flags para controlar funcionalidades:

```typescript
// Configuración por defecto
{
  ticketing: {
    nftEnabled: false,        // NFTs deshabilitado por defecto
    classicEnabled: true      // Ticketing clásico habilitado
  },
  feed: {
    personalizedRanking: true, // Ranking personalizado activo
    socialSignals: true       // Señales sociales habilitadas
  },
  cache: {
    provider: 'memory',       // Cache en memoria por defecto
    enabled: true
  }
}
```

## 🎯 Funcionalidades Implementadas

### ✅ Blockchain Package (Fase 2, Desacoplado)
- Interfaz genérica `BlockchainProvider`
- Adaptadores para Polygon y Solana (stubs)
- Factory pattern para múltiples chains
- Feature flag `nftEnabled=false` por defecto

### ✅ Feed Personalizado
- Algoritmo de ranking dinámico (20-40% compras vs social)
- Boost por proximidad geográfica (+0.2)
- Boost por categorías favoritas (+0.2)
- Ajuste automático basado en señales del usuario

### ✅ Estructura Mobile
- Expo app placeholder funcional
- Documentación de compatibilidad UI
- Tokens de diseño compartidos

### ✅ Internacionalización (i18n)
- Soporte ES/EN con detección automática
- Context API para React
- Carga dinámica de traducciones

### ✅ Testing Infrastructure
- Jest configurado en todos los packages
- React Testing Library para components
- Cobertura de código integrada

### ✅ Performance & Caching
- Sistema de cache LRU en memoria
- Preparado para Redis futuro
- Memoización de endpoints (60s eventos, 300s trending)

### ✅ UX Responsive
- AppShell con sticky header (64px)
- Sidebar alineado al logo
- Right-rail cards cuadradas (min-h-260px)
- Breakpoints móviles

## 📱 Aplicaciones

### Web App (`apps/web`)
- Next.js 14 con App Router
- Tailwind CSS
- Feed personalizado funcional
- I18n integrado

### Mobile App (`apps/mobile`)
- Expo con React Native
- Placeholder "Hello NFTicket"
- Preparado para expansión

## 📦 Packages

### `@nfticket/blockchain`
Infraestructura NFT desacoplada con strategy pattern.

### `@nfticket/api`
Lógica de negocio, feature flags y algoritmos de ranking.

### `@nfticket/cache`
Sistema de caching con soporte LRU y futuro Redis.

### `@nfticket/i18n`
Internacionalización completa ES/EN.

### `@nfticket/ui`
Componentes compartidos web/mobile con design tokens.

## 🛠️ Scripts Disponibles

```bash
pnpm dev          # Desarrollo web
pnpm build        # Build producción
pnpm test         # Tests unitarios
pnpm test:watch   # Tests en modo watch
pnpm lint         # Linting
pnpm typecheck    # Verificación tipos
```

## 🎨 Personalización del Feed

El feed ajusta automáticamente la mezcla de contenido según el comportamiento:

- **Likes en compras > Likes sociales**: ↑ peso de compras (hasta 40%)
- **Categorías favoritas**: +20% boost en score
- **Proximidad geográfica**: +20% boost si está en radio
- **Frescura**: Boost decreciente por antigüedad

## 📄 Documentación

Ver `docs/adr/` para decisiones arquitectónicas y `packages/*/README.md` para detalles específicos.