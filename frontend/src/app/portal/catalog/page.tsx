// ==========================================
// ThreadFlow — Customer Product Catalog
// ==========================================

'use client';

import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Shirt, ShoppingBag, Layers, Scissors, Triangle } from 'lucide-react';

const CATALOG_ITEMS = [
  {
    id: 'polo-shirt',
    name: 'Classic Polo Shirt',
    category: 'Apparel',
    description: 'High-quality cotton blend polo, perfect for corporate uniforms and subtle left-chest embroidery.',
    basePrice: 450,
    image: '/images/embroidered_polo_1787578894220.jpg',
  },
  {
    id: 'lehnga',
    name: 'Custom Lehnga',
    category: 'Traditional Wear',
    description: 'Bespoke lehnga with intricate heavy embroidery options. Fully customizable sizing and patterns.',
    basePrice: 4500,
    image: '/images/embroidered_lehnga_1787578919053.jpg',
  },
  {
    id: 'hoodie',
    name: 'Premium Hoodie',
    category: 'Apparel',
    description: 'Heavyweight fleece hoodie. Ideal for large back logos or bold front chest designs.',
    basePrice: 850,
    image: '/images/embroidered_hoodie_1787578946558.jpg',
  },
  {
    id: 'cap',
    name: 'Baseball Cap',
    category: 'Accessories',
    description: 'Structured 6-panel cap. Great for front center 3D puff embroidery.',
    basePrice: 200,
    image: '/images/embroidered_cap_1787578960648.jpg',
  },
  {
    id: 'jacket',
    name: 'Softshell Jacket',
    category: 'Outerwear',
    description: 'Water-resistant corporate jacket. Recommended for sleek, professional right-chest branding.',
    basePrice: 1200,
    image: '/images/embroidered_jacket_1787578974621.jpg',
  },
  {
    id: 't-shirt',
    name: 'Basic T-Shirt',
    category: 'Apparel',
    description: '100% combed cotton t-shirt. Versatile for any custom embroidery requirement.',
    basePrice: 250,
    image: '/images/embroidered_tshirt_1787578990413.jpg',
  },
];

export default function CatalogPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Product Catalog"
      description="Select a base product to start your personalized order"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG_ITEMS.map((item) => (
          <Card key={item.id} className="flex flex-col h-full hover:border-[var(--color-accent)] transition-colors cursor-default" padding="none">
            <div className="w-full h-56 relative overflow-hidden rounded-t-lg bg-[var(--color-bg-muted)]">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{item.name}</h3>
                <span className="text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-2 py-0.5 rounded">
                  ₹{item.basePrice}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">{item.category}</p>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6 line-clamp-3">
                {item.description}
              </p>
              <Button 
                className="w-full mt-auto" 
                onClick={() => router.push(`/portal/orders/new?product=${item.name}&price=${item.basePrice}`)}
              >
                Customize & Order
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
