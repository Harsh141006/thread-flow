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
    icon: <Shirt className="h-12 w-12 text-[var(--color-accent)]" />,
  },
  {
    id: 'lehnga',
    name: 'Custom Lehnga',
    category: 'Traditional Wear',
    description: 'Bespoke lehnga with intricate heavy embroidery options. Fully customizable sizing and patterns.',
    basePrice: 4500,
    icon: <Layers className="h-12 w-12 text-[var(--color-accent)]" />,
  },
  {
    id: 'hoodie',
    name: 'Premium Hoodie',
    category: 'Apparel',
    description: 'Heavyweight fleece hoodie. Ideal for large back logos or bold front chest designs.',
    basePrice: 850,
    icon: <Layers className="h-12 w-12 text-[var(--color-accent)]" />,
  },
  {
    id: 'cap',
    name: 'Baseball Cap',
    category: 'Accessories',
    description: 'Structured 6-panel cap. Great for front center 3D puff embroidery.',
    basePrice: 200,
    icon: <Triangle className="h-12 w-12 text-[var(--color-accent)]" />, // Placeholder icon for cap
  },
  {
    id: 'jacket',
    name: 'Softshell Jacket',
    category: 'Outerwear',
    description: 'Water-resistant corporate jacket. Recommended for sleek, professional right-chest branding.',
    basePrice: 1200,
    icon: <ShoppingBag className="h-12 w-12 text-[var(--color-accent)]" />,
  },
  {
    id: 't-shirt',
    name: 'Basic T-Shirt',
    category: 'Apparel',
    description: '100% combed cotton t-shirt. Versatile for any custom embroidery requirement.',
    basePrice: 250,
    icon: <Scissors className="h-12 w-12 text-[var(--color-accent)]" />,
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
          <Card key={item.id} className="flex flex-col h-full hover:border-[var(--color-accent)] transition-colors cursor-default">
            <div className="flex justify-center py-6 bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] mb-4">
              {item.icon}
            </div>
            <div className="flex-1">
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
            </div>
            <Button 
              className="w-full mt-auto" 
              onClick={() => router.push(`/portal/orders/new?product=${item.name}&price=${item.basePrice}`)}
            >
              Customize & Order
            </Button>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
