// ==========================================
// ThreadFlow — Customer Multi-Step Order Wizard
// ==========================================

'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/PageContainer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { PageLoader } from '@/components/ui/Spinner';
import { formatCurrency } from '@/utils';
import { ArrowLeft, ArrowRight, CreditCard, Banknote, Smartphone, Upload, CheckCircle2, Image as ImageIcon, Wallet } from 'lucide-react';

const CLOTH_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111827' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Ash Grey', hex: '#D1D5DB' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Forest Green', hex: '#059669' },
  { name: 'Maroon', hex: '#7F1D1D' },
];

const THREAD_COLORS = [
  { name: 'Classic Black', hex: '#000000' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#0A1128' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Forest Green', hex: '#065F46' },
  { name: 'Ruby Red', hex: '#991B1B' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Teal', hex: '#0F766E' },
  { name: 'Plum', hex: '#701A75' },
];

function OrderWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const initialProduct = searchParams.get('product') || '';
  const initialPrice = Number(searchParams.get('price')) || 0;
  const isLehnga = initialProduct.toLowerCase().includes('lehnga');

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Step 1: Specs & Sizing
  const [sizes, setSizes] = useState<Record<string, number | string>>(
    isLehnga ? { blouseSize: 34, skirtLength: 40, dupattaLength: 2.5 } : { S: 0, M: 0, L: 0, XL: 0 }
  );
  
  const [form, setForm] = useState({
    garmentType: initialProduct,
    embroideryPosition: isLehnga ? 'All Over' : 'Left Chest',
    designWidth: isLehnga ? '500' : '80',
    designHeight: isLehnga ? '1000' : '80',
    clothColor: '',
    threadColors: '',
    deadline: '',
    notes: '',
    paymentMethod: 'Credit Card',
    shippingAddress: '',
    contactPhone: '',
  });

  // Step 2: Design Upload
  const [designPreviewUrl, setDesignPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + (isLehnga ? 30 : 14)); // Lehngas take longer
    setForm(prev => ({ ...prev, deadline: d.toISOString().split('T')[0] }));
  }, [isLehnga]);

  const handleSizeChange = (key: string, value: string) => {
    setSizes(prev => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast('error', 'Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDesignPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotalQuantity = () => {
    if (isLehnga) return 1; // 1 Lehnga set per order usually, or we can make it complex. Let's assume 1.
    return Object.values(sizes).reduce((sum, val) => Number(sum) + (Number(val) || 0), 0) as number;
  };

  const quantityNum = calculateTotalQuantity();
  const estimatedTotal = (initialPrice * quantityNum) + (quantityNum * (isLehnga ? 1500 : 50));

  const validateStep1 = () => {
    if (quantityNum <= 0) {
      toast('error', 'Please select at least one item size.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: quantityNum,
          sizes: sizes, // Now sending the JSON object
          designWidth: Number(form.designWidth),
          designHeight: Number(form.designHeight),
          clothColor: form.clothColor,
          threadColors: form.threadColors.split(',').map(c => c.trim()).filter(Boolean),
          estimatedTotal,
          customerDesignPreview: designPreviewUrl,
          priority: 'normal',
          shippingAddress: form.shippingAddress,
          contactPhone: form.contactPhone,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        router.push(`/portal/orders/success?id=${data.data.orderId}`);
      } else {
        toast('error', data.error);
      }
    } catch {
      toast('error', 'Failed to place order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wizard Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--color-border-default)] -z-10"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-accent)] -z-10 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[
          { num: 1, label: 'Specifications' },
          { num: 2, label: 'Artwork' },
          { num: 3, label: 'Payment' }
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center bg-[var(--color-bg-primary)] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${step >= s.num ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white' : 'border-[var(--color-border-default)] bg-white text-[var(--color-text-muted)]'}`}>
              {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card>
        {/* STEP 1: SPECIFICATIONS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Product Details</h3>
            
            <Input 
              label="Product Type" 
              value={form.garmentType} 
              onChange={(e) => setForm({ ...form, garmentType: e.target.value })} 
              readOnly={!!initialProduct}
              className={initialProduct ? 'bg-[var(--color-bg-muted)]' : ''}
            />

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                {isLehnga ? 'Custom Measurements (Inches/Meters)' : 'Size Breakdown'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(sizes).map((key) => (
                  <Input 
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    type="number"
                    min="0"
                    value={sizes[key]}
                    onChange={(e) => handleSizeChange(key, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select 
                label="Embroidery Position" 
                value={form.embroideryPosition} 
                onChange={(e) => setForm({ ...form, embroideryPosition: e.target.value })} 
                options={[
                  { value: 'Left Chest', label: 'Left Chest' },
                  { value: 'Right Chest', label: 'Right Chest' },
                  { value: 'Full Back', label: 'Full Back' },
                  { value: 'All Over', label: 'All Over (Lehnga/Saree)' },
                  { value: 'Border Only', label: 'Border Only' },
                ]} 
              />
              <Input label="Max Design Width (mm)" type="number" min="10" value={form.designWidth} onChange={(e) => setForm({ ...form, designWidth: e.target.value })} />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2 mb-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Cloth Color</label>
              <div className="flex flex-wrap gap-3 p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border-default)]">
                {CLOTH_COLORS.map(color => {
                  const isSelected = form.clothColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => setForm({ ...form, clothColor: color.name })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-[var(--color-accent)] scale-110 shadow-md' : 'border-[var(--color-border-strong)] hover:scale-105'} shadow-sm`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
              <Input label="Selected Cloth Color" value={form.clothColor} onChange={(e) => setForm({ ...form, clothColor: e.target.value })} placeholder="Select from guide or type custom color" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-[var(--color-text-primary)]">Thread Colors</label>
              <div className="flex flex-wrap gap-3 mb-3 p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border-default)]">
                {THREAD_COLORS.map(color => {
                  const currentColors = form.threadColors.split(',').map(c => c.trim()).filter(Boolean);
                  const isSelected = currentColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      title={color.name}
                      onClick={() => {
                        let current = [...currentColors];
                        if (isSelected) {
                          current = current.filter(c => c !== color.name);
                        } else {
                          current.push(color.name);
                        }
                        setForm({ ...form, threadColors: current.join(', ') });
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-[var(--color-accent)] scale-110 shadow-md' : 'border-[var(--color-border-strong)] hover:scale-105'} shadow-sm`}
                      style={{ backgroundColor: color.hex }}
                    />
                  );
                })}
              </div>
              <Input label="Selected Thread Colors" value={form.threadColors} onChange={(e) => setForm({ ...form, threadColors: e.target.value })} placeholder="Select from guide or type custom colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Max Design Height (mm)" type="number" min="10" value={form.designHeight} onChange={(e) => setForm({ ...form, designHeight: e.target.value })} />
              <Input label="Requested Delivery Date" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} hint="Standard time is 14 days" />
            </div>
            
            <div className="flex justify-end pt-4 border-t border-[var(--color-border-default)]">
              <Button onClick={() => validateStep1() && setStep(2)} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Next: Artwork
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: ARTWORK UPLOAD */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Upload Reference Design</h3>
            
            <div 
              className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center transition-colors ${designPreviewUrl ? 'border-[var(--color-accent)] bg-[var(--color-bg-muted)]' : 'border-[var(--color-border-default)] hover:border-[var(--color-text-muted)]'}`}
            >
              {designPreviewUrl ? (
                <div className="flex flex-col items-center">
                  <img src={designPreviewUrl} alt="Preview" className="max-h-[300px] object-contain rounded-[var(--radius-md)] mb-4 shadow-sm" />
                  <Button variant="outline" size="sm" onClick={() => setDesignPreviewUrl('')}>Remove Image</Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-6">SVG, PNG, JPG (Max 5MB)</p>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <Button onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-4 w-4" />}>Select File</Button>
                </div>
              )}
            </div>

            <Textarea label="Design Instructions" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any specific requirements or instructions for our digitizing team?" />

            <div className="flex justify-between pt-4 border-t border-[var(--color-border-default)]">
              <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
              <Button onClick={() => setStep(3)} rightIcon={<ArrowRight className="h-4 w-4" />}>Next: Payment</Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & REVIEW */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">Review & Payment</h3>
            
            <div className="bg-[var(--color-bg-muted)] p-5 rounded-[var(--radius-md)] mb-6">
              <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-4 border-b border-[var(--color-border-default)] pb-2">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Product:</span>
                  <span className="font-medium">{form.garmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Total Quantity:</span>
                  <span className="font-medium">{quantityNum}</span>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-[var(--color-border-default)]">
                  <span className="text-[var(--color-text-secondary)]">Base Cost:</span>
                  <span>{formatCurrency(initialPrice * quantityNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Est. Embroidery Cost:</span>
                  <span>{formatCurrency(quantityNum * (isLehnga ? 1500 : 50))}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-black/10">
                  <span>Estimated Total</span>
                  <span className="text-[var(--color-accent)]">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Shipping & Contact Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Textarea 
                label="Full Shipping Address" 
                required 
                value={form.shippingAddress} 
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} 
                placeholder="123 Street Name, City, State, ZIP" 
              />
              <Input 
                label="Contact Phone Number" 
                required 
                type="tel"
                value={form.contactPhone} 
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} 
                placeholder="+91 98765 43210" 
              />
            </div>

            <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-3">Select Payment Method</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-[var(--radius-md)] cursor-pointer transition-colors ${form.paymentMethod === 'Credit Card' ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/10' : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'}`}>
                <input type="radio" name="payment" value="Credit Card" checked={form.paymentMethod === 'Credit Card'} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                <CreditCard className={`h-8 w-8 mb-2 ${form.paymentMethod === 'Credit Card' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                <span className="text-sm font-medium text-center">Card</span>
              </label>
              
              <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-[var(--radius-md)] cursor-pointer transition-colors ${form.paymentMethod === 'UPI' ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/10' : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'}`}>
                <input type="radio" name="payment" value="UPI" checked={form.paymentMethod === 'UPI'} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                <Smartphone className={`h-8 w-8 mb-2 ${form.paymentMethod === 'UPI' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                <span className="text-sm font-medium text-center">UPI</span>
              </label>
              
              <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-[var(--radius-md)] cursor-pointer transition-colors ${form.paymentMethod === 'Bank Transfer' ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/10' : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'}`}>
                <input type="radio" name="payment" value="Bank Transfer" checked={form.paymentMethod === 'Bank Transfer'} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                <Banknote className={`h-8 w-8 mb-2 ${form.paymentMethod === 'Bank Transfer' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                <span className="text-sm font-medium text-center">Bank Transfer</span>
              </label>
              
              <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-[var(--radius-md)] cursor-pointer transition-colors ${form.paymentMethod === 'Cash on Delivery' ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]/10' : 'border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'}`}>
                <input type="radio" name="payment" value="Cash on Delivery" checked={form.paymentMethod === 'Cash on Delivery'} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="sr-only" />
                <Wallet className={`h-8 w-8 mb-2 ${form.paymentMethod === 'Cash on Delivery' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}`} />
                <span className="text-sm font-medium text-center">Cash on Delivery</span>
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-[var(--color-border-default)]">
              <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
              <Button onClick={handleSubmit} loading={saving} rightIcon={<CheckCircle2 className="h-4 w-4" />} className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 border-none">Confirm & Place Order</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function NewOrderPage() {
  const router = useRouter();

  return (
    <PageContainer
      title="Customize Your Order"
      description="Follow the steps to configure your personalized products"
      action={
        <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => router.back()}>
          Back to Catalog
        </Button>
      }
    >
      <Suspense fallback={<PageLoader />}>
        <OrderWizard />
      </Suspense>
    </PageContainer>
  );
}
