// ==========================================
// ThreadFlow — Customer Design Gallery
// ==========================================

'use client';

import PageContainer from '@/components/layout/PageContainer';
import Image from 'next/image';
import { Palette, Download, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';

const CATEGORIES = ['Corporate', 'Bespoke', 'Custom Art', 'Patches', 'Floral', 'Minimalist', 'Traditional', 'Modern'];
const TITLES = [
  'Corporate Sharp Logo', 'Royal Gold Monogram', 'Vibrant Geometric Abstract', 'Vintage Sierra Patch',
  'Rose Garden Burst', 'Minimalist Line Art', 'Classic Crest', 'Neon Tiger Roar',
  'Subtle Initial', 'Bold Varsity Letter', 'Intricate Mandala', 'Watercolor Butterfly',
  'Heritage Shield', 'Modern Typographic', 'Gothic Lettering', 'Tropical Leaf',
  'Sunburst Motif', 'Abstract Brushstroke', 'Regal Crown', 'Wildflower Bouquet',
  'Geometric Wolf', 'Nautical Anchor', 'Vintage Car Silhouette', 'Art Deco Pattern',
  'Cosmic Galaxy Motif', 'Tribal Band', 'Delicate Fern', 'Retro Arcade Pixel'
];

const DESIGNS = TITLES.map((title, index) => {
  // Use our original generated images for the first 4, then use picsum for the rest
  const originalImages = [
    '/images/design-corporate.jpg',
    '/images/design-monogram.jpg',
    '/images/design-abstract.jpg',
    '/images/design-patch.jpg'
  ];
  
  return {
    id: index + 1,
    title: title,
    category: CATEGORIES[index % CATEGORIES.length],
    image: index < 4 ? originalImages[index] : `https://picsum.photos/seed/design${index}/600/600`,
    description: `A beautifully crafted ${CATEGORIES[index % CATEGORIES.length].toLowerCase()} design, meticulously digitized for premium embroidery results.`,
    threadCount: `${(Math.floor(Math.random() * 20) + 5)},${Math.floor(Math.random() * 900) + 100}`,
    colors: Math.floor(Math.random() * 12) + 1
  };
});

export default function DesignsPage() {
  return (
    <PageContainer
      title="Design Catalog"
      description="Browse our portfolio of embroidery designs for inspiration."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {DESIGNS.map((design) => (
          <div key={design.id} className="bg-white rounded-2xl shadow-sm border border-[var(--color-border-default)] overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-muted)]">
              <Image 
                src={design.image} 
                alt={design.title} 
                fill 
                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-[var(--color-text-secondary)] hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{design.title}</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                  {design.category}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 line-clamp-2">
                {design.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-default)]">
                <div className="flex gap-4 text-sm text-[var(--color-text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="font-medium">{design.colors} Colors</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Request Quote
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
