// ==========================================
// ThreadFlow — Customer Design Gallery
// ==========================================

'use client';

import PageContainer from '@/components/layout/PageContainer';
import Image from 'next/image';
import { Palette, Download, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';

const DESIGNS = [
  {
    id: 1,
    title: 'Corporate Sharp Logo',
    category: 'Corporate',
    image: '/images/design-corporate.jpg',
    description: 'Crisp, professional logo embroidery suited for polo shirts and uniforms.',
    threadCount: '5,400',
    colors: 3
  },
  {
    id: 2,
    title: 'Royal Gold Monogram',
    category: 'Bespoke',
    image: '/images/design-monogram.jpg',
    description: 'Elegant monogram for luxury towels, robes, and premium linens.',
    threadCount: '12,000',
    colors: 1
  },
  {
    id: 3,
    title: 'Vibrant Geometric Abstract',
    category: 'Custom Art',
    image: '/images/design-abstract.jpg',
    description: 'Highly detailed geometric pattern with vibrant colors on denim.',
    threadCount: '24,500',
    colors: 8
  },
  {
    id: 4,
    title: 'Vintage Sierra Patch',
    category: 'Patches',
    image: '/images/design-patch.jpg',
    description: 'Detailed mountain landscape patch, perfect for bags and outdoor gear.',
    threadCount: '18,200',
    colors: 6
  }
];

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
