import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-[var(--color-border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold tracking-tight text-[var(--color-sidebar-bg)]">
                Thread<span className="text-[var(--color-accent)]">Flow</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm font-medium bg-[var(--color-sidebar-bg)] text-white px-5 py-2.5 rounded-full hover:bg-[var(--color-sidebar-hover)] transition-all shadow-md hover:shadow-lg"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl text-[var(--color-sidebar-bg)]">
                  Master the Art of
                  <span className="text-[var(--color-accent)] block mt-1">Embroidery Management</span>
                </h1>
                <p className="mt-3 text-base text-[var(--color-text-secondary)] sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Digitize your embroidery workflow. Manage orders, digitize designs, coordinate production, and deliver premium quality—all from one luxurious platform.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    Start Your Shop
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-[var(--color-sidebar-bg)] bg-white border border-[var(--color-border-default)] hover:bg-[var(--color-bg-muted)] transition-all shadow-sm w-full sm:w-auto"
                  >
                    Client Portal
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden aspect-[4/3] group">
                <Image
                  src="/images/hero-embroidery.jpg"
                  alt="Luxurious gold embroidery on navy fabric"
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Gallery Section */}
      <section className="bg-white py-24 sm:py-32 border-t border-[var(--color-border-default)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sm:text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-sidebar-bg)] sm:text-4xl">
              Precision in Every Thread
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-[var(--color-text-secondary)] sm:mx-auto">
              Showcase your portfolio and manage intricate design files directly in your custom dashboard.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-lg group">
              <Image
                src="/images/hero-embroidery.jpg"
                alt="Gold thread details"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-4 left-6 text-white font-medium text-lg drop-shadow-md">Premium Gold Series</div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-video shadow-lg group">
              <Image
                src="/images/gallery-1.jpg"
                alt="Colorful floral embroidery"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-4 left-6 text-white font-medium text-lg drop-shadow-md">Bespoke Florals</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
