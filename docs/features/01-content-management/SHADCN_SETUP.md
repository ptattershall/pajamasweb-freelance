# shadcn/ui Setup Guide

## Overview

shadcn/ui has been successfully initialized in the project. This provides a collection of high-quality, accessible React components built with Tailwind CSS.

## Setup Details

### Configuration Files

- **components.json** - shadcn/ui configuration
  - Style: New York
  - Icon Library: Lucide
  - Base Color: Neutral
  - CSS Variables: Enabled
  - RSC: Enabled (React Server Components)

### Installed Components

The following shadcn/ui components have been pre-installed:

- **Button** - `components/ui/button.tsx`
- **Input** - `components/ui/input.tsx`
- **Card** - `components/ui/card.tsx`
- **Dialog** - `components/ui/dialog.tsx`
- **Form** - `components/ui/form.tsx`
- **Label** - `components/ui/label.tsx`

### Dependencies Added

- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes
- `lucide-react` - Icon library

### CSS Variables

Tailwind CSS variables have been added to `app/globals.css` for theming:

- Color variables (primary, secondary, accent, destructive, etc.)
- Chart colors for data visualization
- Border radius configuration

## Adding More Components

To add additional shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add textarea select checkbox
```

## Usage Example

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

## Documentation

For more information, visit: https://ui.shadcn.com/docs

