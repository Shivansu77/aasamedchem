import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white overflow-x-hidden">
      
      {/* Top Header & Hero combined background */}
      <div className="bg-gradient-to-br from-[#eaf2f6] to-[#d6e6ef] pb-24 relative overflow-hidden">
        
        {/* Large decorative shape on right */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />

        {/* Navigation Header */}
        <header className="relative z-50 px-6 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-md transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                AASA <span className="font-light text-slate-600">Medchem</span>
              </span>
            </div>

            {/* Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <Link href="/" className="text-slate-800">Home</Link>
              <Link href="#catalog" className="hover:text-brand-600 transition-colors">Catalog</Link>
              <Link href="#services" className="hover:text-brand-600 transition-colors">Services</Link>
              <Link href="#contact" className="hover:text-brand-600 transition-colors">Contact Us</Link>
            </nav>

            {/* Right Action */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={session.user.role === "admin" ? "/admin" : "/seller"}
                    className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full border border-slate-200 shadow-sm transition-all cursor-pointer" />
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-white hover:bg-slate-50 text-brand-600 text-sm font-bold rounded-full transition-all shadow-sm border border-slate-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-12 px-6 max-w-7xl mx-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 pr-8">
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Premium Chemicals for <br />
                <span className="text-slate-800">Advanced Research</span>
              </h1>
              
              <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
                Seamlessly advance scalable architectures with future-ready growth
                strategies. Efficiently implement low-risk, high-return process
                enhancements tailored for mission-critical testing procedures, especially
                in publishing and related industries.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <Link
                  href="/seller/catalog"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  View Catalog
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
                
                <Link href="/seller/catalog" className="flex items-center gap-4 bg-white px-5 py-3 rounded-full shadow-md border border-slate-100 flex-1 max-w-xs hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-800 font-bold uppercase tracking-wider">Search the Catalog</p>
                    <p className="text-[10px] text-slate-500 font-medium">With Advanced Filtering</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right Image area */}
            <div className="relative flex justify-end h-full min-h-[400px]">
               {/* Doctor/Chemist Image */}
               <div className="relative z-10 w-full max-w-[480px]">
                  <Image
                    src="/chemist_female.png"
                    alt="Lead Chemist"
                    width={480}
                    height={600}
                    priority
                    className="object-contain object-bottom drop-shadow-2xl"
                  />
                  {/* Floating badge */}
                  <div className="absolute top-12 right-0 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-700">2500+ Compounds</span>
                  </div>
               </div>
            </div>
          </div>
        </section>
      </div>

      {/* Metrics Row (overlapping) */}
      <section className="px-6 max-w-6xl mx-auto -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 text-center">
          <div>
            <p className="text-4xl font-extrabold text-slate-800 mb-1">4500+</p>
            <p className="text-sm text-slate-500 font-medium">Happy Clients</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-800 mb-1">200</p>
            <p className="text-sm text-slate-500 font-medium">Warehouses</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-800 mb-1">500+</p>
            <p className="text-sm text-slate-500 font-medium">Award Win</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-slate-800 mb-1">20+</p>
            <p className="text-sm text-slate-500 font-medium">Logistics Hubs</p>
          </div>
        </div>
      </section>

      {/* Search Multi-Filter Bar */}
      <section className="px-6 max-w-5xl mx-auto mt-12 mb-20">
        <form action="/seller/catalog" method="GET" className="bg-[#6b9cb4] p-3 rounded-2xl shadow-lg flex flex-col md:flex-row gap-3">
          <FilterSelect placeholder="Select Department" />
          <FilterSelect placeholder="Select Compound" />
          <FilterSelect placeholder="Select Date" />
          <FilterSelect placeholder="Select Location" />
          <button type="submit" className="bg-white text-[#6b9cb4] hover:bg-slate-50 font-bold px-8 py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </button>
        </form>
      </section>

      {/* Category Icons Grid */}
      <section id="catalog" className="py-16 px-6 max-w-6xl mx-auto space-y-12 bg-white rounded-3xl mb-24 shadow-sm border border-slate-100">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-800">Department Category</h2>
          <p className="text-slate-500 text-sm">
            Browse by department for tailored services and expert solutions
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
          <CategoryIconBox icon={<KidneyIcon />} />
          <CategoryIconBox icon={<HeartIcon />} />
          <CategoryIconBox icon={<LungsIcon />} />
          <CategoryIconBox icon={<ToothIcon />} />
          <CategoryIconBox icon={<BrainIcon />} />
          <CategoryIconBox icon={<SkeletonIcon />} />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-[#6b9cb4] py-24 px-6 mt-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text & Cards */}
          <div className="space-y-10 relative z-10">
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                World-Class Healthcare<br/>
                Services for you and your<br/>
                loved ones
              </h2>
              <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-full border border-white/30 transition-all flex items-center gap-2">
                More Service &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <ServiceCard 
                title="Radiology & Imaging" 
                desc="Advanced diagnostic imaging services including X-ray, CT scan, MRI, and ultrasound to assist in accurate and efficient diagnosis."
              />
              <ServiceCard 
                title="Emergency Services" 
                desc="24/7 immediate medical care for critical conditions, accidents, and life-threatening situations."
                offset
              />
              <ServiceCard 
                title="Pharmacy" 
                desc="In-house medical store providing prescribed medications and health essentials, ensuring timely access."
              />
              <ServiceCard 
                title="Laboratory Services" 
                desc="Comprehensive lab testing for blood, urine, and other samples, supporting fast and precise medical diagnosis."
                offset
              />
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end items-end h-full">
            <Image
              src="/chemist.png"
              alt="Male Doctor"
              width={500}
              height={700}
              className="object-contain object-bottom drop-shadow-2xl z-10"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <span>AASA Medchem</span>
          </div>
          <p>&copy; 2026 AASA Medchem. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* Helpers */

function FilterSelect({ placeholder }) {
  return (
    <div className="flex-1 bg-[#85b1c5] rounded-xl px-4 py-3 relative">
      <select className="w-full bg-transparent text-white font-medium focus:outline-none appearance-none cursor-pointer">
        <option className="text-slate-800">{placeholder}</option>
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </div>
  );
}

function CategoryIconBox({ icon }) {
  return (
    <div className="aspect-square bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-[#6b9cb4] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer p-6">
      {icon}
    </div>
  );
}

function ServiceCard({ title, desc, offset }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-xl ${offset ? 'sm:translate-y-8' : ''}`}>
      <div className="w-12 h-12 bg-[#eaf2f6] rounded-xl flex items-center justify-center text-[#6b9cb4] mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}

/* Simple Icons */
function KidneyIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C8.5 3 5 5 5 9.5S8.5 15 12 18c3.5-3 7-5.5 7-8.5S15.5 3 12 3z" /></svg>; }
function HeartIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>; }
function LungsIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v3a3 3 0 01-3 3z" /></svg>; }
function ToothIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-2.5 0-4-1.5-4-3.5V5c0-1.5 1.5-2 4-2s4 .5 4 2v5.5c0 2-1.5 3.5-4 3.5zm-4 0c0 2 1 3.5 1.5 4.5S10 21 10 21.5c0 .5-.5.5-.5 1h5c0-.5-.5-.5-.5 1s.5-2 .5-3S16 16 16 14" /></svg>; }
function BrainIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0" /></svg>; }
function SkeletonIcon() { return <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>; }
