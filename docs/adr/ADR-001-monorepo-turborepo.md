# ADR-001: Monorepo con Turborepo

## Estado
Aceptado

## Contexto
NFTicket necesita soportar múltiples aplicaciones (web, mobile) y compartir código entre ellas. Decidimos entre:

1. **Multirepo**: Cada app/package por separado
2. **Monorepo con Lerna**: Tooling tradicional
3. **Monorepo con Turborepo**: Build system moderno

## Decisión
Elegimos **Turborepo** para el monorepo por:

- **Builds incrementales**: Solo rebuilds lo que cambió
- **Cache distribuido**: Acelera CI/CD significativamente  
- **Paralelización inteligente**: Respeta dependencias
- **Developer Experience**: Hot reload cross-packages
- **Ecosistema moderno**: Primera clase con Next.js/Vercel

## Estructura Adoptada
```
apps/
  web/        # Next.js app
  mobile/     # Expo app
packages/
  ui/         # Shared components
  api/        # Business logic
  blockchain/ # NFT infrastructure
  cache/      # Performance layer
  i18n/       # Internationalization
```

## Consecuencias

### Positivas
- Compartir código eficientemente
- Refactoring atómico cross-packages
- Tooling unificado (linting, testing)
- Deploy coordinado

### Negativas  
- Learning curve para el equipo
- Configuración inicial más compleja
- Potencial coupling entre packages

## Alternativas Consideradas
- **Nx**: Más pesado, orientado a enterprise
- **Rush**: Microsoft stack, menos adoption
- **Yarn Workspaces solo**: Sin build optimization