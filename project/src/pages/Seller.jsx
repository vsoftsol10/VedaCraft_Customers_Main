import React, { useRef, useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Monitor,
  TrendingUp,
  Tag,
  ShieldCheck,
  Handshake,
  UserCircle,
  UserPlus,
  ClipboardList,
  Box,
  Store,
  Leaf,
  Heart,
  ShoppingBag,
  Package,
  MapPin,
  Megaphone,
  Truck,
  Headphones,
  Award,
  Check,
} from "lucide-react";
import Pot from "../assets/pot4.png";

/* ---------------------------------------------
   Data
--------------------------------------------- */

const reasons = [
  {
    icon: Users,
    title: "Reach More Customers",
    desc: "Showcase your products to thousands of eco-conscious customers.",
  },
  {
    icon: Monitor,
    title: "We Handle the Digital Side",
    desc: "We manage your online store, orders, payments, and digital selling experience.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Business",
    desc: "Get more visibility, promotions, and opportunities to increase your sales.",
  },
  {
    icon: Tag,
    title: "Simple Seller Experience",
    desc: "Add your products easily and let Vedacraft take care of the online marketplace experience.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Receive your earnings securely and track your payments with confidence.",
  },
  {
    icon: Handshake,
    title: "Build Customer Trust",
    desc: "Sell through a trusted marketplace that helps customers discover and shop from your brand.",
  },
  {
    icon: UserCircle,
    title: "Let Customers Know You",
    desc: "Share your story, craft, and the inspiration behind your products.",
  },
  {
    icon: Megaphone,
    title: "Marketing & Promotions",
    desc: "Get featured in campaigns, offers, and recommendations to boost your visibility.",
  },
  {
    icon: Truck,
    title: "Logistics Support",
    desc: "We simplify shipping and delivery so you can focus on what you do best – creating.",
  },
  {
    icon: Headphones,
    title: "Dedicated Seller Support",
    desc: "Our support team is always here to help you at every step of your journey.",
  },
  {
    icon: Award,
    title: "Fair & Transparent Platform",
    desc: "No hidden charges. Clear policies and fair practices you can always rely on.",
  },
];
const steps = [
  {
    icon: UserPlus,
    num: "01",
    title: "Create Your Seller Account",
    desc: "Sign up and provide your basic information.",
  },
  {
    icon: ClipboardList,
    num: "02",
    title: "Complete Your Business Profile",
    desc: "Add business, store, bank details and required documents.",
  },
  {
    icon: Box,
    num: "03",
    title: "Add Your Products",
    desc: "Upload product images, details, pricing and stock.",
  },
  {
    icon: Store,
    num: "04",
    title: "Start Selling",
    desc: "Once approved, your store goes live and you can start receiving orders.",
  },
];

const faqs = [
  {
    q: "Who can sell on Vedacraft?",
    a: "Any artisan, small business, or manufacturer creating handmade, natural, or sustainable products can apply to sell on Vedacraft.",
  },
  {
    q: "How much does Vedacraft charge?",
    a: "Vedacraft charges a small commission on each sale, with no hidden fees. Full pricing details are shared during onboarding.",
  },
  {
    q: "What documents do I need?",
    a: "You'll need basic business identification, bank account details, and any applicable tax registration documents.",
  },
  {
    q: "How will I receive my earnings?",
    a: "Earnings are transferred directly to your linked bank account on a regular payout cycle, which you can track from your seller dashboard.",
  },
];

const CARDS_PER_VIEW = 3;
const pages = [];
for (let i = 0; i < reasons.length; i += CARDS_PER_VIEW) {
  pages.push(reasons.slice(i, i + CARDS_PER_VIEW));
}

/* ---------------------------------------------
   Decorative leaf line-art (used inside Hero)
--------------------------------------------- */

function LeafDoodle({ className }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="#8FA876" strokeWidth="1.2" opacity="0.5">
        <path d="M10 100 Q 60 40, 120 30" />
        <ellipse cx="45" cy="75" rx="18" ry="8" transform="rotate(-30 45 75)" />
        <ellipse cx="75" cy="55" rx="18" ry="8" transform="rotate(-25 75 55)" />
        <ellipse cx="105" cy="38" rx="16" ry="7" transform="rotate(-15 105 38)" />
        <path d="M10 100 Q 50 110, 90 150" />
        <ellipse cx="40" cy="112" rx="16" ry="7" transform="rotate(25 40 112)" />
        <ellipse cx="65" cy="130" rx="16" ry="7" transform="rotate(35 65 130)" />
      </g>
    </svg>
  );
}

function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={26} strokeWidth={1.6} className="text-[#2F6B3A] shrink-0" />
      <div className="leading-tight">
        <div className="font-bold text-[#1B3B2F] text-base">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   Hero
--------------------------------------------- */

function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#F6EEDD]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(246, 238, 221, 0.98) 0%, rgba(246, 238, 221, 0.94) 34%, rgba(246, 238, 221, 0.58) 56%, rgba(246, 238, 221, 0.12) 100%), url(${Pot})`,
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <LeafDoodle className="absolute -top-4 -left-6 w-40 h-40 sm:w-52 sm:h-52 pointer-events-none" />
      <LeafDoodle className="absolute bottom-0 -left-10 w-48 h-48 sm:w-64 sm:h-64 rotate-[210deg] opacity-70 pointer-events-none" />

      <svg
        className="absolute top-24 left-1/3 w-40 h-16 hidden lg:block pointer-events-none opacity-40"
        viewBox="0 0 160 60"
        fill="none"
      >
        <path
          d="M2 30 Q 30 2, 60 30 T 120 30"
          stroke="#C9B98A"
          strokeWidth="1.2"
        />
      </svg>

      <svg
        className="absolute right-10 top-16 hidden h-36 w-36 opacity-50 lg:block"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={8 + col * 16}
              cy={8 + row * 16}
              r="1.6"
              fill="#C9B98A"
            />
          ))
        )}
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-8 pb-3 md:pt-10 md:pb-2">
        <div className="max-w-[520px]">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#16301F] leading-[1.02] mb-2">
            Sell on
            <br />
            Vedacraft
          </h1>

          <svg
            viewBox="0 0 200 20"
            className="w-36 h-3 text-[#D9A441] mb-4"
            fill="none"
          >
            <path
              d="M2 14 Q 12 2, 22 14 T 42 14 T 62 14 T 82 14 T 102 14 T 122 14 T 142 14 T 162 14 T 182 14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-gray-700 text-base sm:text-lg max-w-md mb-4 leading-relaxed">
            Turn your handmade, natural and sustainable products into a
            growing business.
          </p>

          <div className="grid max-w-md grid-cols-3 gap-4 mb-5">
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <Users size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                Reach more customers
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <Monitor size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                We handle the digital side
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <ShieldCheck size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                Secure payments &amp; dedicated support
              </span>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 bg-[#167321] hover:bg-[#0f5f18] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm">
            Start Selling Today <ArrowRight size={18} />
          </button>

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-700">
            <span className="w-6 h-6 rounded-full bg-[#167321] text-white flex shrink-0 items-center justify-center">
              <Check size={14} strokeWidth={3} />
            </span>
            Trusted by thousands of sellers across India
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pb-4 pt-3">
        <div className="bg-[#FAF6EC]/95 rounded-lg px-6 sm:px-10 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
          <StatItem icon={Users} value="10,000+" label="Happy Sellers" />
          <StatItem
            icon={ShoppingBag}
            value="1 Lakh+"
            label="Products Listed"
          />
          <StatItem
            icon={Package}
            value="5 Lakh+"
            label="Orders Delivered"
          />
          <StatItem
            icon={MapPin}
            value="Across India"
            label="Shipping to 29,000+ Pincodes"
          />
        </div>
      </div>
    </section>
  );
}

function ImageColumnHero() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#F6EEDD] via-[#F5EFE1] to-[#F0EEDD] overflow-hidden">
      {/* Decorative leaf doodles */}
      <LeafDoodle className="absolute -top-4 -left-6 w-40 h-40 sm:w-52 sm:h-52 pointer-events-none" />
      <LeafDoodle className="absolute bottom-0 -left-10 w-48 h-48 sm:w-64 sm:h-64 rotate-[210deg] opacity-70 pointer-events-none" />

      {/* Faint wavy divider line, decorative */}
      <svg
        className="absolute top-24 left-1/3 w-40 h-16 hidden lg:block pointer-events-none opacity-40"
        viewBox="0 0 160 60"
        fill="none"
      >
        <path
          d="M2 30 Q 30 2, 60 30 T 120 30"
          stroke="#C9B98A"
          strokeWidth="1.2"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10 px-6 sm:px-10 pt-12 pb-8 md:pt-16 md:pb-10">
        {/* Left column */}
        <div className="relative z-10">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#16301F] leading-[1.05] mb-3">
            Sell on
            <br />
            Vedacraft
          </h1>

          {/* Squiggle underline */}
          <svg
            viewBox="0 0 200 20"
            className="w-40 h-4 text-[#D9A441] mb-6"
            fill="none"
          >
            <path
              d="M2 14 Q 12 2, 22 14 T 42 14 T 62 14 T 82 14 T 102 14 T 122 14 T 142 14 T 162 14 T 182 14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-gray-600 text-base sm:text-lg max-w-md mb-8">
            Turn your handmade, natural and sustainable products into a
            growing business.
          </p>

          {/* Trust icon row */}
          <div className="flex items-start gap-6 sm:gap-8 mb-8">
            <div className="flex flex-col items-center text-center w-24">
              <span className="w-12 h-12 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-2">
                <Users size={20} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                Reach more customers
              </span>
            </div>
            <div className="flex flex-col items-center text-center w-24">
              <span className="w-12 h-12 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-2">
                <Monitor size={20} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                We handle the digital side
              </span>
            </div>
            <div className="flex flex-col items-center text-center w-24">
              <span className="w-12 h-12 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-2">
                <ShieldCheck size={20} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                Secure payments &amp; dedicated support
              </span>
            </div>
          </div>

          <button className="inline-flex items-center gap-2 bg-[#2F6B3A] hover:bg-[#26592F] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors shadow-sm">
            Start Selling Today <ArrowRight size={16} />
          </button>

          <div className="flex items-center gap-2 mt-6 text-sm text-gray-600">
            <span className="w-5 h-5 rounded-full bg-[#2F6B3A] text-white flex items-center justify-center text-[10px]">
              ✓
            </span>
            Trusted by thousands of sellers across India
          </div>
        </div>

        {/* Right column — image with floating badges */}
        <div className="relative z-10">
          {/* soft green blob behind image */}
          <div className="absolute -top-6 right-4 w-64 h-64 sm:w-80 sm:h-80 bg-[#D9E4C7] rounded-full opacity-60 blur-[2px]" />

          {/* dotted texture */}
          <svg
            className="absolute -top-2 right-0 w-28 h-28 opacity-50 hidden sm:block"
            viewBox="0 0 100 100"
          >
            {Array.from({ length: 6 }).map((_, row) =>
              Array.from({ length: 6 }).map((_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={8 + col * 16}
                  cy={8 + row * 16}
                  r="1.6"
                  fill="#C9B98A"
                />
              ))
            )}
          </svg>

          <div className="relative rounded-2xl overflow-hidden h-[320px] sm:h-[420px] md:h-[460px] lg:h-[520px]">
            <img
              src={Pot}
              alt="Woven baskets and ceramic vase with greenery"
              className="w-full h-full object-cover"
            />
          </div>

          {/* "Made by you" floating badge */}
          <div className="absolute top-6 left-4 sm:-left-6 bg-white/90 backdrop-blur rounded-2xl shadow-md px-5 py-3 flex items-center gap-3 max-w-[220px]">
            <Leaf size={20} className="text-[#2F6B3A] shrink-0" />
            <p className="text-sm text-[#1B3B2F] leading-snug">
              Made by you.
              <br />
              Shared by Vedacraft.
            </p>
            <Heart
              size={14}
              className="text-[#D9A441] fill-[#D9A441] absolute -bottom-2 left-6"
            />
          </div>

          {/* Sellers count floating badge */}
          <div className="absolute -bottom-6 right-2 sm:right-6 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[#2F6B3A] flex items-center justify-center shrink-0">
              <Users size={18} className="text-white" />
            </span>
            <p className="text-sm leading-tight">
              <span className="block font-bold text-[#1B3B2F]">10,000+</span>
              <span className="block text-gray-500 text-xs">
                Sellers growing
                <br />
                with Vedacraft
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pb-10 pt-6">
        <div className="bg-[#FAF6EC] rounded-2xl px-6 sm:px-10 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
          <StatItem icon={Users} value="10,000+" label="Happy Sellers" />
          <StatItem
            icon={ShoppingBag}
            value="1 Lakh+"
            label="Products Listed"
          />
          <StatItem
            icon={Package}
            value="5 Lakh+"
            label="Orders Delivered"
          />
          <StatItem
            icon={MapPin}
            value="Across India"
            label="Shipping to 29,000+ Pincodes"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------
   Why Sell on Vedacraft — 3-cards-per-scroll carousel
--------------------------------------------- */

function WhySellSection() {
  const trackRef = useRef(null);
  const [activePage, setActivePage] = useState(0);
  const totalPages = pages.length;

  const scrollToPage = (pageIndex) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pageIndex, totalPages - 1));
    const pageEl = track.children[clamped];
    if (pageEl) {
      track.scrollTo({ left: pageEl.offsetLeft, behavior: "smooth" });
    }
    setActivePage(clamped);
  };

  const handlePrev = () => scrollToPage(activePage - 1);
  const handleNext = () => scrollToPage(activePage + 1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const children = Array.from(track.children);
        let closest = 0;
        let closestDist = Infinity;
        children.forEach((child, i) => {
          const dist = Math.abs(child.offsetLeft - track.scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setActivePage(closest);
        ticking = false;
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="w-full bg-white py-16 px-4 sm:px-8">
      <style>{`.vc-track::-webkit-scrollbar { display: none; }`}</style>

      <div className="max-w-6xl mx-auto text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3B2F]">
          Why Sell on Vedacraft?
        </h2>
        <p className="text-gray-500 mt-2">
          You focus on your products. We help you grow online.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <button
          type="button"
          onClick={handlePrev}
          disabled={activePage === 0}
          aria-label="Previous cards"
          className="hidden sm:flex items-center justify-center absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-500 hover:text-[#2F6B3A] hover:border-[#2F6B3A] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={trackRef}
          className="vc-track flex overflow-x-auto scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {pages.map((pageCards, pageIdx) => (
            <div
              key={pageIdx}
              className="snap-start shrink-0 w-full grid grid-cols-1 sm:grid-cols-3 gap-6 px-1 py-2"
            >
              {pageCards.map((reason, i) => {
                const idx = pageIdx * CARDS_PER_VIEW + i;
                const Icon = reason.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-200 bg-white px-6 py-8 flex flex-col items-start text-left hover:shadow-lg hover:border-[#2F6B3A]/40 transition-all duration-200"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#EAF3EA] text-[10px] font-semibold text-[#2F6B3A] mb-4">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      size={30}
                      strokeWidth={1.6}
                      className="text-[#2F6B3A] mb-4"
                    />
                    <h3 className="text-base font-semibold text-[#1B3B2F] mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {reason.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={activePage === totalPages - 1}
          aria-label="Next cards"
          className="hidden sm:flex items-center justify-center absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md text-gray-500 hover:text-[#2F6B3A] hover:border-[#2F6B3A] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollToPage(i)}
            aria-label={`Go to page ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-200 ${
              activePage === i
                ? "w-6 bg-[#2F6B3A]"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------
   How to Sell on Vedacraft
--------------------------------------------- */

function HowToSellSection() {
  return (
    <section className="w-full bg-white pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3B2F]">
          How to Sell on Vedacraft
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 relative">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="flex flex-col items-center text-center relative px-2"
            >
              {i < steps.length - 1 && (
                <span className="hidden md:block absolute top-4 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] text-gray-300">
                  <ArrowRight
                    size={16}
                    className="absolute -top-2 right-0 text-gray-300"
                  />
                  <span className="block border-t border-dashed border-gray-300 mt-2" />
                </span>
              )}
              <span className="w-8 h-8 rounded-full bg-[#EEEBDD] text-xs font-semibold text-[#1B3B2F] flex items-center justify-center mb-4">
                {step.num}
              </span>
              <Icon
                size={30}
                strokeWidth={1.5}
                className="text-[#1B3B2F] mb-4"
              />
              <h3 className="text-sm font-semibold text-[#1B3B2F] mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------
   CTA Banner
--------------------------------------------- */

function CtaBanner() {
  return (
    <section className="w-full px-4 sm:px-8 pb-16">
      <div className="max-w-6xl mx-auto bg-[#F4F2E9] rounded-2xl px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <span className="text-2xl">🏬</span>
          <div>
            <h3 className="font-semibold text-[#1B3B2F]">
              Ready to grow your business with Vedacraft?
            </h3>
            <p className="text-sm text-gray-500">
              Join thousands of sellers who trust us to sell their products.
            </p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#2F6B3A] hover:bg-[#26592F] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors whitespace-nowrap">
          Start Selling Today <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------
   FAQ
--------------------------------------------- */

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="w-full px-4 sm:px-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3B2F] text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[#1B3B2F] hover:bg-gray-50 transition-colors"
                >
                  {item.q}
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------
   Page
--------------------------------------------- */

export default function SellOnVedacraftPage() {
  return (
    <div className="w-full min-h-screen bg-white font-sans">
      <Hero />
      <WhySellSection />
      <HowToSellSection />
      <CtaBanner />
      <FaqSection />
    </div>
  );
}
