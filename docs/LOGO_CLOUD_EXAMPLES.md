# LogoCloud Integration Examples

## Quick Start

### Option 1: Use the Pre-built Demo
```tsx
import { LogoCloudDemo } from "@/components/landing/logo-cloud-demo";

export default function LandingPage() {
  return (
    <>
      {/* ... other content ... */}
      <LogoCloudDemo />
      {/* ... other content ... */}
    </>
  );
}
```

### Option 2: Create Custom Logo Cloud
```tsx
import { LogoCloud } from "@/components/ui/logo-cloud-3";

const myLogos = [
  {
    src: "https://example.com/logo1.svg",
    alt: "Client 1",
    width: 120,
    height: 40,
  },
  {
    src: "https://example.com/logo2.svg",
    alt: "Client 2",
    width: 120,
    height: 40,
  },
  // ... add more logos
];

export function ClientShowcase() {
  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Trusted by Leading Companies
        </h2>
        <LogoCloud logos={myLogos} />
      </div>
    </section>
  );
}
```

## Props Reference

### LogoCloud Component
```tsx
interface LogoCloudProps extends React.ComponentProps<"div"> {
  logos: Logo[];
}

interface Logo {
  src: string;           // Image URL
  alt: string;           // Alt text for accessibility
  width?: number;        // Optional logo width
  height?: number;       // Optional logo height
}
```

### InfiniteSlider Component (Advanced)
```tsx
interface InfiniteSliderProps {
  children: React.ReactNode;
  gap?: number;          // Space between items (default: 16)
  duration?: number;     // Total animation duration in seconds
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical'; // Default: 'horizontal'
  reverse?: boolean;     // Reverse direction (default: false)
  className?: string;    // Additional CSS classes
  speed?: number;        // Pixels per second (default: 80)
  speedOnHover?: number; // Speed on hover in px/sec
}
```

## Styling Customization

### Custom Styling
```tsx
<LogoCloud 
  logos={myLogos}
  className="bg-white py-16 border-t border-b border-gray-200"
/>
```

### Responsive Adjustments
```tsx
<div className="bg-gradient-to-b from-white to-gray-50">
  <section className="py-8 md:py-16 lg:py-24">
    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4 md:mb-8">
      Our Trusted Partners
    </h2>
    <LogoCloud logos={logos} className="px-4 md:px-8" />
  </section>
</div>
```

## Popular Logo Sources

1. **SVGL** - https://svgl.app
   - Large collection of tech company SVGs
   - Used in the demo component

2. **SimpleIcons** - https://simpleicons.org
   - 3000+ brand SVGs
   - Monochrome designs

3. **LogoIpsum** - https://logoipsum.com
   - Placeholder logos with customization

4. **Custom Assets**
   - Use your own SVG/PNG files
   - Can be hosted on your server or CDN

## Animation Control Examples

### Slow Scroll
```tsx
<InfiniteSlider gap={42} speed={40}>
  {children}
</InfiniteSlider>
```

### Fast Scroll
```tsx
<InfiniteSlider gap={42} speed={150}>
  {children}
</InfiniteSlider>
```

### Vertical Scroll
```tsx
<InfiniteSlider 
  gap={20} 
  direction="vertical" 
  speed={60}
>
  {children}
</InfiniteSlider>
```

### Hover Deceleration
```tsx
<InfiniteSlider 
  gap={42} 
  speed={80} 
  speedOnHover={25}
>
  {children}
</InfiniteSlider>
```

## Dark Mode Support

The LogoCloud component automatically supports dark mode:
```tsx
{/* Images automatically invert in dark mode */}
<LogoCloud logos={logos} className="dark:bg-slate-900" />
```

The CSS applies: `dark:brightness-0 dark:invert`

## Accessibility Features

- ✅ Proper `alt` text on all images
- ✅ `loading="lazy"` for performance
- ✅ `pointer-events-none` prevents interaction issues
- ✅ Semantic HTML structure
- ✅ High contrast in both light and dark modes

## Performance Tips

1. **Lazy Loading**: Images use `loading="lazy"`
2. **SVG Format**: Use SVGs instead of PNGs for smaller file sizes
3. **CDN Hosting**: Use a CDN for logo images
4. **Animation Performance**: framer-motion uses GPU acceleration

## Troubleshooting

### Logos Not Showing
- Check that `src` URLs are accessible
- Verify CORS settings if using external CDN
- Check browser console for image loading errors

### Animation Stuttering
- Reduce the number of logos displayed
- Increase the `gap` value
- Check for heavy concurrent animations

### Dark Mode Images Not Inverting
- Ensure `dark:brightness-0 dark:invert` classes are applied
- For colored logos, you may need custom dark mode styles

## Integration Patterns

### With Section Divider
```tsx
<>
  <div className="border-t border-gray-200" />
  <section className="py-12">
    <LogoCloud logos={logos} />
  </section>
  <div className="border-b border-gray-200" />
</>
```

### With Background Pattern
```tsx
<section className="relative py-12 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50" />
  <div className="relative z-10">
    <LogoCloud logos={logos} />
  </div>
</section>
```

### With Text Content
```tsx
<section className="py-16">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold mb-4">Trusted by 1000+ Companies</h2>
    <p className="text-gray-600 mb-8">
      Join leading organizations using our platform
    </p>
    <LogoCloud logos={logos} />
  </div>
</section>
```
