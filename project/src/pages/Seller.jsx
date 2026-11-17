import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
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
            {t('sellerPage.hero.title1')}
            <br />
            {t('sellerPage.hero.title2')}
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
            {t('sellerPage.hero.sub')}
          </p>

          <div className="grid max-w-md grid-cols-3 gap-4 mb-5">
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <Users size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                {t('sellerPage.hero.reachCustomers')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <Monitor size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                {t('sellerPage.hero.digitalSide')}
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="w-10 h-10 rounded-full bg-[#E7EFDD] flex items-center justify-center mb-1.5">
                <ShieldCheck size={18} className="text-[#2F6B3A]" />
              </span>
              <span className="text-xs font-medium text-[#1B3B2F] leading-snug">
                {t('sellerPage.hero.securePayments')}
              </span>
            </div>
          </div>

          <button onClick={() => navigate('/seller/onboarding')} className="inline-flex items-center gap-2 bg-[#167321] hover:bg-[#0f5f18] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-sm">
            {t('sellerPage.hero.cta')} <ArrowRight size={18} />
          </button>

          <div className="flex items-center gap-2 mt-4 text-sm text-gray-700">
            <span className="w-6 h-6 rounded-full bg-[#167321] text-white flex shrink-0 items-center justify-center">
              <Check size={14} strokeWidth={3} />
            </span>
            {t('sellerPage.hero.trustedBadge')}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 pb-4 pt-3">
        <div className="bg-[#FAF6EC]/95 rounded-lg px-6 sm:px-10 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm">
          <StatItem icon={Users} value="10,000+" label={t('sellerPage.stats.happySellers')} />
          <StatItem
            icon={ShoppingBag}
            value="1 Lakh+"
            label={t('sellerPage.stats.productsListed')}
          />
          <StatItem
            icon={Package}
            value="5 Lakh+"
            label={t('sellerPage.stats.ordersDelivered')}
          />
          <StatItem
            icon={MapPin}
            value={t('sellerPage.stats.acrossIndia')}
            label={t('sellerPage.stats.shippingCoverage')}
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
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const [activePage, setActivePage] = useState(0);

  const reasons = useMemo(() => [
    { icon: Users, title: t('sellerPage.whySell.r1_title'), desc: t('sellerPage.whySell.r1_desc') },
    { icon: Monitor, title: t('sellerPage.whySell.r2_title'), desc: t('sellerPage.whySell.r2_desc') },
    { icon: TrendingUp, title: t('sellerPage.whySell.r3_title'), desc: t('sellerPage.whySell.r3_desc') },
    { icon: Tag, title: t('sellerPage.whySell.r4_title'), desc: t('sellerPage.whySell.r4_desc') },
    { icon: ShieldCheck, title: t('sellerPage.whySell.r5_title'), desc: t('sellerPage.whySell.r5_desc') },
    { icon: Handshake, title: t('sellerPage.whySell.r6_title'), desc: t('sellerPage.whySell.r6_desc') },
    { icon: UserCircle, title: t('sellerPage.whySell.r7_title'), desc: t('sellerPage.whySell.r7_desc') },
    { icon: Megaphone, title: t('sellerPage.whySell.r8_title'), desc: t('sellerPage.whySell.r8_desc') },
    { icon: Truck, title: t('sellerPage.whySell.r9_title'), desc: t('sellerPage.whySell.r9_desc') },
    { icon: Headphones, title: t('sellerPage.whySell.r10_title'), desc: t('sellerPage.whySell.r10_desc') },
    { icon: Award, title: t('sellerPage.whySell.r11_title'), desc: t('sellerPage.whySell.r11_desc') },
  ], [t]);

  const CARDS_PER_VIEW = 3;
  const pages = useMemo(() => {
    const list = [];
    for (let i = 0; i < reasons.length; i += CARDS_PER_VIEW) {
      list.push(reasons.slice(i, i + CARDS_PER_VIEW));
    }
    return list;
  }, [reasons]);

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
          {t('sellerPage.whySell.heading')}
        </h2>
        <p className="text-gray-500 mt-2">
          {t('sellerPage.whySell.sub')}
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
  const { t } = useTranslation();
  const steps = useMemo(() => [
    {
      icon: UserPlus,
      num: "01",
      title: t('sellerPage.howToSell.s1_title'),
      desc: t('sellerPage.howToSell.s1_desc'),
    },
    {
      icon: ClipboardList,
      num: "02",
      title: t('sellerPage.howToSell.s2_title'),
      desc: t('sellerPage.howToSell.s2_desc'),
    },
    {
      icon: Box,
      num: "03",
      title: t('sellerPage.howToSell.s3_title'),
      desc: t('sellerPage.howToSell.s3_desc'),
    },
    {
      icon: Store,
      num: "04",
      title: t('sellerPage.howToSell.s4_title'),
      desc: t('sellerPage.howToSell.s4_desc'),
    },
  ], [t]);

  return (
    <section className="w-full bg-white pb-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1B3B2F]">
          {t('sellerPage.howToSell.heading')}
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <section className="w-full px-4 sm:px-8 pb-16">
      <div className="max-w-6xl mx-auto bg-[#F4F2E9] rounded-2xl px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <span className="text-2xl">🏬</span>
          <div>
            <h3 className="font-semibold text-[#1B3B2F]">
              {t('sellerPage.ctaBanner.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('sellerPage.ctaBanner.sub')}
            </p>
          </div>
        </div>
        <button onClick={() => navigate('/seller/onboarding')} className="inline-flex items-center gap-2 bg-[#2F6B3A] hover:bg-[#26592F] text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors whitespace-nowrap">
          {t('sellerPage.ctaBanner.btn')} <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------
   FAQ
--------------------------------------------- */

function FaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = useMemo(() => [
    {
      q: t('sellerPage.faqs.q1'),
      a: t('sellerPage.faqs.a1'),
    },
    {
      q: t('sellerPage.faqs.q2'),
      a: t('sellerPage.faqs.a2'),
    },
    {
      q: t('sellerPage.faqs.q3'),
      a: t('sellerPage.faqs.a3'),
    },
    {
      q: t('sellerPage.faqs.q4'),
      a: t('sellerPage.faqs.a4'),
    },
  ], [t]);

  return (
    <section className="w-full px-4 sm:px-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1B3B2F] text-center mb-8">
          {t('sellerPage.faqs.heading')}
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
