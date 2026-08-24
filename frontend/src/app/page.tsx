import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Scissors, Palette, Gem, CheckCircle2, Clock, ShieldCheck, Zap, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-accent)] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/70 backdrop-blur-xl z-50 border-b border-[var(--color-border-default)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-black tracking-tight text-[var(--color-sidebar-bg)] flex items-center gap-2">
                <Scissors className="h-6 w-6 text-[var(--color-accent)]" />
                Thread<span className="text-[var(--color-accent)]">Flow</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-[var(--color-sidebar-bg)] hover:text-[var(--color-accent)] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-sm font-semibold bg-[var(--color-sidebar-bg)] text-white px-6 py-2.5 rounded-full hover:bg-[var(--color-accent)] transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[#4169E1] blur-[120px] rounded-full mix-blend-multiply filter"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent-hover)] text-sm font-bold mb-6 shadow-sm border border-[var(--color-accent-muted)]">
                <Sparkles className="h-4 w-4" />
                <span>Premium Embroidery Management</span>
              </div>
              <h1 className="text-5xl tracking-tight font-black sm:leading-none lg:text-6xl xl:text-7xl text-[var(--color-sidebar-bg)]">
                Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[#D4AF37]">Excellence</span> <br/> in Every Stitch
              </h1>
              <p className="mt-6 text-lg text-[var(--color-text-secondary)] sm:text-xl lg:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0">
                Transform your tailoring and embroidery shop with digital precision. Manage bespoke orders, rich color palettes, and intricate designs in one elegant platform.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-[var(--color-sidebar-bg)] hover:bg-[var(--color-accent)] transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full sm:w-auto group"
                >
                  Start Your Shop
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-[var(--color-sidebar-bg)] bg-white border-2 border-[var(--color-border-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all shadow-sm w-full sm:w-auto"
                >
                  Client Portal
                </Link>
              </div>
            </div>
            
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6 relative">
              <div className="relative mx-auto w-full lg:max-w-lg aspect-square">
                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-accent)] to-[#1D4ED8] rounded-[3rem] rotate-6 opacity-20 scale-105 blur-xl"></div>
                <div className="absolute inset-0 bg-[var(--color-sidebar-bg)] rounded-[3rem] -rotate-3 transition-transform duration-700 hover:rotate-0"></div>
                
                <div className="absolute inset-2 rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white/10">
                  <Image
                    src="/images/hero-embroidery.jpg"
                    alt="Luxurious gold embroidery on navy fabric"
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-sidebar-bg)]/80 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Gem className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Premium Gold Series</p>
                        <p className="text-white/80 text-sm">Bespoke Navy Velvet</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-[var(--color-accent)] tracking-widest uppercase mb-3">Why Choose Us</h2>
            <h3 className="text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              Elevating the Craft of Embroidery
            </h3>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)]">
              Our digital platform seamlessly connects the timeless art of embroidery with modern efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Palette className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">Vibrant Color Matching</h4>
              <p className="text-[var(--color-text-secondary)]">Precise thread color selection ensuring your brand colors are accurately represented.</p>
            </div>
            
            <div className="p-8 rounded-3xl bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">Rapid Digitization</h4>
              <p className="text-[var(--color-text-secondary)]">Fast turnaround times converting your digital artwork into high-quality stitch files.</p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">Premium Quality</h4>
              <p className="text-[var(--color-text-secondary)]">Multi-stage quality control ensuring zero skipped stitches and perfect tension.</p>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] transition-colors group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-[var(--color-accent)]" />
              </div>
              <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">Real-time Tracking</h4>
              <p className="text-[var(--color-text-secondary)]">Monitor your order status live from the client portal, from design to dispatch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-[var(--color-sidebar-bg)] py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)]"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Endless Creative Possibilities
            </h2>
            <p className="mt-6 text-xl text-slate-300">
              From corporate logos to bespoke floral art. Equip your customers with an expansive catalog of designs and rich color palettes.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Gallery Item 1 */}
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl group border border-white/10">
              <Image src="/images/design-corporate.jpg" alt="Corporate Logo" fill className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-bold text-lg">Corporate Sharp</p>
                <p className="text-[var(--color-accent)] text-sm font-medium">Polo Shirts & Uniforms</p>
              </div>
            </div>

            {/* Gallery Item 2 */}
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl group border border-white/10 sm:mt-12">
              <Image src="/images/design-monogram.jpg" alt="Elegant Monogram" fill className="object-cover group-hover:scale-110 group-hover:-rotate-1 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-bold text-lg">Royal Monograms</p>
                <p className="text-[var(--color-accent)] text-sm font-medium">Towels & Linens</p>
              </div>
            </div>

            {/* Gallery Item 3 */}
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl group border border-white/10">
              <Image src="/images/design-abstract.jpg" alt="Abstract Geometric" fill className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-bold text-lg">Vibrant Abstract</p>
                <p className="text-[var(--color-accent)] text-sm font-medium">Denim Jackets</p>
              </div>
            </div>

            {/* Gallery Item 4 */}
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-2xl group border border-white/10 sm:mt-12">
              <Image src="/images/design-patch.jpg" alt="Vintage Patch" fill className="object-cover group-hover:scale-110 group-hover:-rotate-1 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-bold text-lg">Vintage Patches</p>
                <p className="text-[var(--color-accent)] text-sm font-medium">Bags & Accessories</p>
              </div>
            </div>
          </div>
          
          <div className="mt-20 text-center">
             <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold rounded-full text-[var(--color-sidebar-bg)] bg-[var(--color-accent)] hover:bg-white hover:text-[var(--color-sidebar-bg)] transition-all shadow-xl hover:shadow-white/20 w-full sm:w-auto"
              >
                <Palette className="h-5 w-5" />
                Explore Customer Portal
              </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
              Trusted by Top Brands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-[var(--color-border-default)] shadow-sm hover:shadow-xl transition-shadow">
              <div className="flex gap-1 text-[var(--color-accent)] mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-[var(--color-text-secondary)] mb-6 italic">
                "ThreadFlow completely transformed how we order our corporate uniforms. The digital approval process and color matching is flawless."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)]">Sarah Jenkins</h4>
                  <p className="text-sm text-[var(--color-text-muted)]">VP Operations, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-[var(--color-border-default)] shadow-sm hover:shadow-xl transition-shadow">
              <div className="flex gap-1 text-[var(--color-accent)] mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-[var(--color-text-secondary)] mb-6 italic">
                "The bespoke quality is unmatched. Being able to choose the exact thread and cloth colors directly from the portal saved us hours of back-and-forth."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div>
                  <h4 className="font-bold text-[var(--color-text-primary)]">Michael Chen</h4>
                  <p className="text-sm text-[var(--color-text-muted)]">Founder, Apex Apparel</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-[var(--color-border-default)] shadow-sm hover:shadow-xl transition-shadow bg-[var(--color-sidebar-bg)] text-white">
              <div className="flex gap-1 text-[var(--color-accent)] mb-6">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-lg text-slate-300 mb-6 italic">
                "We needed 500 embroidered jackets for a major event. Not only did they deliver ahead of schedule, but every single stitch was perfect."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700" />
                <div>
                  <h4 className="font-bold text-white">Elena Rodriguez</h4>
                  <p className="text-sm text-slate-400">Event Director, Global Summit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
