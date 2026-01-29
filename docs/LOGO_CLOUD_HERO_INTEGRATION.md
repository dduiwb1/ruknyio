# Integration into Hero Section

## Current Hero Section Options

### Option A: Add LogoCloud Below Hero Content
Edit your hero section to include:

```tsx
import { LogoCloud } from "@/components/ui/logo-cloud-3";

export function HeroSection() {
  const clientLogos = [
    {
      src: "https://svgl.app/library/visa.svg",
      alt: "Visa",
    },
    {
      src: "https://svgl.app/library/mastercard.svg",
      alt: "MasterCard",
    },
    // ... more payment method logos
  ];

  return (
    <>
      {/* Existing hero content */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6">Your Headline</h1>
          <p className="text-xl text-gray-600 mb-12">Your subtitle</p>
          {/* Your CTA buttons */}
        </div>
      </section>

      {/* New LogoCloud Section */}
      <section className="py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-600 mb-8">
            Trusted by thousands of users worldwide
          </p>
          <LogoCloud logos={clientLogos} />
        </div>
      </section>
    </>
  );
}
```

### Option B: Standalone Component Import
Add to your page layout:

```tsx
import { LogoCloudDemo } from "@/components/landing/logo-cloud-demo";

export default function LandingPage() {
  return (
    <main>
      {/* ... existing hero content ... */}
      
      {/* Add the demo component */}
      <LogoCloudDemo />
      
      {/* ... rest of content ... */}
    </main>
  );
}
```

## For Your Payment Methods Section

Since your current hero has payment method cards, you can create a branded LogoCloud variant:

```tsx
import { InfiniteSlider } from "@/components/ui/infinite-slider";

const paymentMethods = [
  { name: "Visa", color: "text-blue-600" },
  { name: "MasterCard", color: "text-red-600" },
  { name: "FastPay", color: "text-pink-600" },
  { name: "QiCard", color: "text-yellow-500" },
  { name: "AsiaPay", color: "text-orange-600" },
  { name: "FIB", color: "text-green-600" },
  { name: "ZainCash", color: "text-yellow-500" },
];

export function PaymentMethodsCarousel() {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-center text-gray-600 mb-6 text-sm">
          نحن ندعم جميع طرق الدفع الآمنة
        </p>
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <InfiniteSlider gap={32} reverse speed={80} speedOnHover={25}>
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className="flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <span className={`font-medium text-sm ${method.color}`}>
                  {method.name}
                </span>
              </div>
            ))}
          </InfiniteSlider>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
```

## Implementation Checklist

- [ ] Import `LogoCloud` component
- [ ] Prepare logos array with `src` and `alt` fields
- [ ] Choose placement on landing page
- [ ] Customize styling with className prop
- [ ] Test on mobile and desktop
- [ ] Verify all logo images load correctly
- [ ] Check dark mode appearance
- [ ] Adjust animation speed if needed

## File Locations Reference

- **Component**: `/apps/web/src/components/ui/logo-cloud-3.tsx`
- **InfiniteSlider**: `/apps/web/src/components/ui/infinite-slider.tsx`
- **Demo**: `/apps/web/src/components/landing/logo-cloud-demo.tsx`

## Testing in Dev

```bash
# In the web app directory
npm run dev

# Visit localhost:3000 and navigate to the page with LogoCloud
```

Look for:
- Smooth infinite scrolling animation
- Proper spacing between logos
- Responsive behavior on smaller screens
- Dark mode support if applicable
- Fade effect at edges (gradient mask)
