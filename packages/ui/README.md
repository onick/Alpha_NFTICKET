# @nfticket/ui

Shared UI components for NFTicket web and mobile applications.

## Component Categories

### Web-Only Components
These components use DOM-specific APIs and are only compatible with web applications:
- `Modal` (uses ReactDOM.createPortal)
- `Tooltip` (uses DOM positioning)
- `Dropdown` (uses DOM event handling)

### Cross-Platform Components
These components work on both web and mobile:
- `Button`
- `Card` 
- `Text`
- `Container`
- `Grid`

## Usage

```tsx
import { Button, Card, theme } from '@nfticket/ui';

export function MyComponent() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## Theme Tokens

All design tokens are exported from the theme and can be used across web and mobile:

```tsx
import { theme } from '@nfticket/ui';

const styles = {
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
  }
};
```