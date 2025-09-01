import { Loading, ProductCardLoading, ProductGridLoading, ProductDetailLoading, TableLoading, FormLoading, PageLoading } from "./loading";

# Loading Components Usage Guide

This guide shows you how to use the various loading components available in the application.

## Basic Loading Component

The main `Loading` component supports multiple variants and sizes:

### Variants
- `spinner` (default) - Rotating spinner
- `skeleton` - Skeleton placeholder using existing skeleton component
- `dots` - Animated dots
- `bars` - Animated bars

### Sizes
- `sm` - Small (16px)
- `md` - Medium (32px) - default
- `lg` - Large (48px)
- `xl` - Extra Large (64px)

### Examples

```tsx
// Basic spinner
<Loading />

// Large spinner with text
<Loading variant="spinner" size="lg" text="Loading products..." />

// Dots animation
<Loading variant="dots" size="md" />

// Bars animation
<Loading variant="bars" size="lg" />

// Full screen loading
<Loading variant="spinner" size="xl" text="Loading..." fullScreen />
```

## Specific Loading Components

### Product Card Loading
Use this for loading individual product cards:
```tsx
<ProductCardLoading />
```

### Product Grid Loading
Use this for loading multiple product cards in a grid:
```tsx
<ProductGridLoading count={8} />
```

### Product Detail Loading
Use this for loading product detail pages:
```tsx
<ProductDetailLoading />
```

### Table Loading
Use this for loading data tables:
```tsx
<TableLoading rows={10} columns={5} />
```

### Form Loading
Use this for loading forms:
```tsx
<FormLoading />
```

### Page Loading
Use this for full page loading states:
```tsx
<PageLoading text="Loading dashboard..." />
```

## Button Loading States

For buttons with loading states, use the small spinner variant:

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loading variant="spinner" size="sm" className="mr-2" />
      Saving...
    </>
  ) : (
    "Save"
  )}
</Button>
```

## Implementation Examples

### In Pages
```tsx
// app/products/loading.tsx
import { ProductGridLoading } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductGridLoading count={12} />
    </div>
  );
}
```

### In Components
```tsx
function ProductList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  if (loading) {
    return <ProductGridLoading count={8} />;
  }

  return <ProductGrid products={products} />;
}
```

### In Admin Components
```tsx
function AdminTable() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent>
          <TableLoading rows={10} columns={6} />
        </CardContent>
      </Card>
    );
  }

  // ... rest of component
}
```

## Best Practices

1. **Match the loading state to the expected content**: Use `ProductGridLoading` when loading products, `TableLoading` for tables, etc.

2. **Consider the context**: Use appropriate sizes and variants based on the available space and design requirements.

3. **Include meaningful text**: When possible, include descriptive text about what is being loaded.

4. **Use consistent patterns**: Stick to the same loading patterns throughout your application for better UX.

5. **Handle error states**: Always provide fallbacks for when loading fails.

6. **Performance**: The loading components are lightweight and performant, but avoid rendering hundreds of skeleton items unnecessarily.

## Customization

All loading components accept standard React props and can be customized with Tailwind CSS classes:

```tsx
<Loading 
  variant="spinner" 
  size="lg" 
  className="text-blue-500" 
  text="Custom loading message..." 
/>
```

The components are built using Tailwind CSS and can be easily themed to match your application's design system.
