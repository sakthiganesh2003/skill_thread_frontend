'use client';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, Star, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import GarmentCard from '@/components/customer/GarmentCard';
import { garmentsAPI } from '@/lib/api';

const SLIDES = [
  {
    label: "Premium Custom Tailoring",
    title: (
      <>
        Clothes crafted<br />
        for <em className="italic text-gold">your</em> form,<br />
        not theirs.
      </>
    ),
    desc: "Enter your measurements once. Browse our fabrics. Let our master tailors create garments that fit you — and only you.",
    cta: "Browse garments",
    link: "/garments",
    image: "/tailor_working_hero_1776405081516.png"
  },
  {
    label: "Fabric Library",
    title: (
      <>
        Discover the<br />
        <em className="italic text-gold">finest</em> materials<br />
        worldwide.
      </>
    ),
    desc: "From Italian wool to pure Indian silks, choose the foundation of your next masterpiece from our curated collection.",
    cta: "Explore Fabrics",
    link: "/garments",
    image: "/fabrics_rack_hero_1776405097516.png"
  },
  {
    label: "Legacy of Precision",
    title: (
      <>
        A fit that feels<br />
        like a <em className="italic text-gold">second</em> skin,<br />
        every single time.
      </>
    ),
    desc: "Our master tailors combine traditional techniques with modern precision to ensure a 100% fit guarantee on every order.",
    cta: "Start your order",
    link: "/garments",
    image: "/bespoke_suit_hero_1776405112646.png"
  },
  {
    label: "Master Craftsmanship",
    title: (
      <>
        We don't weave threads.<br />
        We weave <em className="italic text-gold">confidence</em>,<br />
        into every stitch.
      </>
    ),
    desc: "Browse our extensive palette of premium sewing threads, chosen exclusively to complement the richest fabrics available.",
    cta: "View Collections",
    link: "/garments",
    image: "/colorful_threads_hero_1776405520738.png"
  }
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const { data: garments = [], isLoading } = useQuery({
    queryKey: ['garments'],
    queryFn: async () => {
      const { data } = await garmentsAPI.list();
      return data;
    },
  });

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      <Navbar />

      {/* HERO SLIDER (FULL SCREEN) */}
      <section className="relative h-screen bg-dark overflow-hidden flex flex-col">
        {/* Background Images */}
        {SLIDES.map((slide, i) => (
          <div 
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[8000ms] ease-linear"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                transform: i === activeSlide ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 flex-1 flex items-center px-8 md:px-20 pt-16">
          <div className="max-w-3xl">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-gold" />
                <span className="text-gold text-xs tracking-widest uppercase font-bold">
                  {SLIDES[activeSlide].label}
                </span>
              </div>
              
              <h1 className="font-serif text-5xl md:text-8xl font-light leading-tight mb-6 text-white" key={`title-${activeSlide}`}>
                {SLIDES[activeSlide].title}
              </h1>
              
              <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-12" key={`desc-${activeSlide}`}>
                {SLIDES[activeSlide].desc}
              </p>

              <div className="flex gap-6 flex-wrap">
                <Link href={SLIDES[activeSlide].link} className="btn-primary px-10 py-4 text-base">
                  {SLIDES[activeSlide].cta}
                </Link>
                <Link href="#how" className="flex items-center gap-2 text-white font-medium hover:text-gold transition-colors">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold">
                    <ArrowRight size={18} className="-rotate-45" />
                  </div>
                  See how it works
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex gap-12 mt-20 flex-wrap opacity-80">
                {[
                  { icon: Star, label: '4.9★ rating', sub: '2,400+ orders' },
                  { icon: Clock, label: '7–10 days', sub: 'delivery' },
                  { icon: Shield, label: '100% fit', sub: 'guarantee' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-4 text-white">
                    <Icon size={24} className="text-gold" />
                    <div>
                      <div className="text-base font-medium">{label}</div>
                      <div className="text-xs text-white/50">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Navigation */}
        <div className="relative z-20 px-8 md:px-20 pb-12 flex items-end justify-between">
          <div className="flex items-center gap-8">
            <div className="flex gap-3">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${i === activeSlide ? 'w-20 bg-gold' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
            <div className="text-xs font-bold tracking-[.3em] text-white/40 uppercase tabular-nums">
              0{activeSlide + 1} <span className="mx-2 text-white/10">/</span> 0{SLIDES.length}
            </div>
          </div>

          <div className="hidden md:flex gap-4">
            <button 
              onClick={() => setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              className="p-4 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-gold transition-all backdrop-blur-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide}
              className="p-4 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-gold transition-all backdrop-blur-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-dark py-8 px-8 grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-white/10">
        {[
          { big: '12', lbl: 'Fabric types' },
          { big: '7–10', lbl: 'Days delivery' },
          { big: '₹999+', lbl: 'Starting price' },
          { big: '48', lbl: 'Master tailors' },
          { big: '100%', lbl: 'Fit guarantee' },
        ].map(({ big, lbl }) => (
          <div key={lbl} className="text-center py-2 px-4">
            <div className="font-serif text-3xl text-gold-light font-light">{big}</div>
            <div className="text-white/50 text-xs tracking-widest uppercase mt-1">{lbl}</div>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-8 md:px-20">
        <div className="section-label">Process</div>
        <h2 className="heading-serif text-4xl md:text-5xl mb-14">Five steps to your perfect fit</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {[
            { n: '01', title: 'Browse & select', desc: 'Choose garment, fabric and color.' },
            { n: '02', title: 'Add measurements', desc: 'Enter once. Reused on every order.' },
            { n: '03', title: 'Customize style', desc: 'Collar, sleeve, embroidery & more.' },
            { n: '04', title: 'Tailor assigned', desc: 'Admin matches you to best tailor.' },
            { n: '05', title: 'Door delivery', desc: 'Track every step in real time.' },
          ].map((step, i) => (
            <div
              key={step.n}
              className="pt-6 pr-6 border-t-2 border-border hover:border-gold transition-colors group"
            >
              <div className="font-serif text-5xl text-border group-hover:text-gold-light transition-colors font-light mb-4">
                {step.n}
              </div>
              <div className="text-sm font-medium mb-2">{step.title}</div>
              <div className="text-xs text-warm-gray leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GARMENTS GRID */}
      <section className="pb-24 px-8 md:px-20">
        <div className="section-label">Collection</div>
        <div className="flex items-end justify-between mb-10">
          <h2 className="heading-serif text-4xl md:text-5xl">Choose your garment</h2>
          <Link href="/garments" className="text-sm text-gold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-border/40 rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {garments.slice(0, 6).map((g: any) => (
              <GarmentCard key={g.id} garment={g} />
            ))}
          </div>
        )}
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-8 md:px-20 bg-surface border-t border-border">
        <div className="section-label">Reviews</div>
        <h2 className="heading-serif text-4xl mb-14">What our customers say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { q: '"The sherwani fit perfectly — like it was made just for me. Because it was."', name: 'Arjun Mehta', role: 'Wedding customer, Mumbai' },
            { q: '"I\'ve ordered 4 kurtas and every single one arrived on time, perfectly stitched."', name: 'Priya Nair', role: 'Regular customer, Kochi' },
            { q: '"The live tracking is brilliant. I knew exactly when my suit was being stitched."', name: 'Karthik Rajan', role: 'Corporate customer, Chennai' },
          ].map((t) => (
            <div key={t.name} className="card p-8">
              <div className="text-gold text-sm mb-4">★★★★★</div>
              <p className="font-serif text-xl italic leading-relaxed mb-6">{t.q}</p>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-warm-gray">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark text-cream py-16 px-8 md:px-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="font-serif text-xl font-semibold mb-4">
              Silk<span className="text-gold">thread</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Custom tailoring made simple. Every step tracked, every garment crafted with care.
            </p>
          </div>
          {[
            { heading: 'Shop', links: ['Sherwanis', 'Kurtas', 'Suits', 'Saree blouses', 'Lehengas'] },
            { heading: 'Account', links: ['Login', 'My orders', 'Measurements', 'Support'] },
            { heading: 'Company', links: ['About us', 'Our tailors', 'Careers', 'Contact'] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <div className="text-gold text-xs tracking-widest uppercase mb-5">{heading}</div>
              {links.map((l) => (
                <div key={l} className="text-white/50 text-sm mb-2 hover:text-white cursor-pointer transition-colors">{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex justify-between text-white/30 text-xs">
          <span>© 2024 Silkthread. All rights reserved.</span>
          <span>Built with ♥ in India</span>
        </div>
      </footer>
    </>
  );
}
