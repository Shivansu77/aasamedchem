import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#070d10] text-[#e2f3f5] font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      {/* Background radial glow leaks */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[180px] -translate-x-1/2 pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#070d10]/80 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-transform duration-300">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              aasa<span className="text-brand-400">medchem</span>
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="/" className="hover:text-brand-400 transition-colors text-white">
              Home
            </a>
            <a href="#catalog" className="hover:text-brand-400 transition-colors">
              Compounds Catalog
            </a>
            <a href="#services" className="hover:text-brand-400 transition-colors">
              Synthesis Services
            </a>
            <a href="#research" className="hover:text-brand-400 transition-colors">
              Research Blog
            </a>
            <a href="#contact" className="hover:text-brand-400 transition-colors">
              Contact Us
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/50 hidden lg:inline-block font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  {session.user.role === "admin" ? "⚙️ " : "👤 "}
                  {session.user.email}
                </span>
                <a
                  href={session.user.role === "admin" ? "/admin" : "/seller"}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-500/10 hover:-translate-y-0.5 duration-200"
                >
                  Dashboard
                </a>
                <LogoutButton className="px-3 py-2 bg-white/5 hover:bg-red-500/10 text-white/80 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-xs font-semibold rounded-xl transition-all cursor-pointer" />
              </div>
            ) : (
              <a
                href="/login"
                className="px-4.5 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-500/15 hover:-translate-y-0.5 duration-200 cursor-pointer"
              >
                Sign In Portal
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Soft Green Tag */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-400 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              2500+ Active Compounds Online
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Premium Compounds for a
                <br />
                <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                  Healthy Lifestyle
                </span>
              </h1>
              <p className="text-white/60 text-base sm:text-lg max-w-xl leading-relaxed">
                Seamlessly advance scalable architectures with future-ready growth
                strategies. Efficiently implement low-risk, high-return process
                enhancements tailored for mission-critical testing procedures, especially
                in publishing and medicinal industries.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 duration-200 cursor-pointer group"
              >
                View Our Catalog
                <svg
                  className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </a>

              {/* Floaty Search bar */}
              <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-sm max-w-sm w-full">
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Search the Medical</p>
                  <p className="text-xs text-white/70">With more Care Option</p>
                </div>
              </div>
            </div>

            {/* Metrics Counter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">4500+</p>
                <p className="text-xs text-white/50 font-medium">Happy Patients</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">200</p>
                <p className="text-xs text-white/50 font-medium">Hospital Room</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">500+</p>
                <p className="text-xs text-white/50 font-medium">Award Win</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-white">20+</p>
                <p className="text-xs text-white/50 font-medium">Ambulance</p>
              </div>
            </div>
          </div>

          {/* Right Column Portrait Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Decorative background shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-tr from-brand-600/20 to-brand-400/10 rounded-[3rem] rotate-6 border border-brand-500/20 z-0" />
            
            {/* Image frame */}
            <div className="relative z-10 w-full max-w-[360px] aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 bg-surface-50 shadow-2xl">
              <Image
                src="/chemist_female.png"
                alt="Medicinal Chemist"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Multi-Filter Bar */}
      <section className="px-6 max-w-7xl mx-auto -mt-4 mb-20 relative z-20">
        <div className="backdrop-blur-xl bg-surface-50/60 border border-white/10 p-5 rounded-2xl shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <FilterSelect label="Select Department" placeholder="All Backbones" />
          <FilterSelect label="Select Doctor" placeholder="Lead Chemist" />
          <FilterSelect label="Select Date" placeholder="Earliest Delivery" />
          <FilterSelect label="Select Location" placeholder="Global Warehouses" />
          <button className="w-full h-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 duration-200 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </section>

      {/* Backbone Categories grid */}
      <section id="catalog" className="py-16 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white">Department Category</h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            Browse by department for tailored services and expert solutions
          </p>
        </div>

        {/* Categories Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <CategoryCard title="Kidney & Alkyls" icon={<KidneyIcon />} />
          <CategoryCard title="Cardiology & Benzenes" icon={<HeartIcon />} />
          <CategoryCard title="Pulmonology & Gases" icon={<LungsIcon />} />
          <CategoryCard title="Dental & Calcium" icon={<ToothIcon />} />
          <CategoryCard title="Neurology & Choline" icon={<BrainIcon />} />
          <CategoryCard title="Skeletal & Polyols" icon={<SkeletonIcon />} />
        </div>
      </section>

      {/* Services and Doctor Section */}
      <section id="services" className="py-16 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text and Cards */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                World-Class Healthcare
                <br />
                Services for you and your loved ones
              </h2>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 border border-white/10 text-white text-xs font-bold transition-all">
                More Service
                <span>&rarr;</span>
              </button>
            </div>

            {/* List of services in card structures matching mock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ServiceCard
                title="Radiology & Imaging"
                description="Advanced diagnostic imaging services including X-ray, CT scan, MRI, and ultrasound to assist in accurate and efficient diagnosis of medical conditions."
              />
              <ServiceCard
                title="Emergency Services"
                description="24/7 immediate medical care for critical conditions, accidents, and life-threatening situations. Equipped to handle trauma, cardiac arrest, and urgent interventions."
              />
              <ServiceCard
                title="Laboratory Services"
                description="Comprehensive lab testing for blood, urine, and other samples, supporting fast and precise medical diagnosis and treatment planning."
              />
              <ServiceCard
                title="Pharmacy"
                description="In-house medical store providing prescribed medications and health essentials, ensuring timely access to necessary drugs for both inpatients and outpatients."
              />
            </div>
          </div>

          {/* Right Doctor Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Glow backing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-gradient-to-br from-brand-600/10 to-transparent rounded-[3rem] rotate-3 pointer-events-none" />

            {/* Frame */}
            <div className="relative z-10 w-full max-w-[340px] aspect-[4/5] rounded-[3.5rem] overflow-hidden border border-white/10 bg-surface-50 shadow-2xl">
              <Image
                src="/chemist.png"
                alt="Lead Chemist Analyst"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#05090b] px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              aasa<span className="text-brand-400">medchem</span> Specialists
            </span>
          </div>
          <p className="text-xs text-white/30">
            &copy; 2026 aasamedchem &middot; Healthcare and Medicinal Compounds Dashboard &middot; All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Helper Components */

function FilterSelect({ label, placeholder }) {
  return (
    <div className="text-left w-full space-y-1">
      <span className="text-[10px] text-white/40 uppercase font-black tracking-wider block">
        {label}
      </span>
      <select className="w-full bg-transparent border-0 text-sm text-white focus:outline-none focus:ring-0 font-medium cursor-pointer pr-4 appearance-none select-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%228%22%20viewBox%3D%220%200%2014%208%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L7%207L13%201%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_0px_center] bg-no-repeat">
        <option className="bg-[#0c161a] text-white">{placeholder}</option>
      </select>
    </div>
  );
}

function CategoryCard({ title, icon }) {
  return (
    <div className="backdrop-blur-md bg-surface-50 border border-white/10 hover:border-brand-500/30 p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-4 group hover:scale-[1.03] transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:text-brand-300 transition-colors duration-300">
        {icon}
      </div>
      <span className="text-xs font-semibold text-white/80 tracking-tight group-hover:text-white transition-colors">
        {title}
      </span>
    </div>
  );
}

function ServiceCard({ title, description }) {
  return (
    <div className="backdrop-blur-sm bg-surface-50/40 border border-white/5 p-5 rounded-2xl space-y-2 hover:border-brand-500/20 transition-all duration-200">
      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h4 className="font-bold text-white/95 text-sm">{title}</h4>
      <p className="text-xs text-white/45 leading-relaxed">{description}</p>
    </div>
  );
}

/* Inline DDL/Chemical Icon SVGs */

function KidneyIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8.5 3 5 5 5 9.5S8.5 15 12 18c3.5-3 7-5.5 7-8.5S15.5 3 12 3z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function LungsIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" />
    </svg>
  );
}

function ToothIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-2.5 0-4-1.5-4-3.5V5c0-1.5 1.5-2 4-2s4 .5 4 2v5.5c0 2-1.5 3.5-4 3.5zm-4 0c0 2 1 3.5 1.5 4.5S10 21 10 21.5c0 .5-.5.5-.5 1h5c0-.5-.5-.5-.5-1s.5-2 .5-3S16 16 16 14" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0" />
    </svg>
  );
}

function SkeletonIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}
