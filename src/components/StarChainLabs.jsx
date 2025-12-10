import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Code, 
  Globe, 
  BarChart3, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Menu, 
  X,
  Lock,
  Zap,
  Server
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-white">NEXUS CHAIN</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#services" className="hover:text-cyan-400 transition-colors duration-200 text-sm font-medium">Services</a>
                <a href="#mlm-solutions" className="hover:text-cyan-400 transition-colors duration-200 text-sm font-medium">MLM Solutions</a>
                <a href="#process" className="hover:text-cyan-400 transition-colors duration-200 text-sm font-medium">Process</a>
                <a href="#case-studies" className="hover:text-cyan-400 transition-colors duration-200 text-sm font-medium">Case Studies</a>
              </div>
            </div>
            
            <div className="hidden md:block">
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-sm text-sm font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Get a Quote
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#services" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 hover:text-cyan-400">Services</a>
              <a href="#mlm-solutions" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 hover:text-cyan-400">MLM Solutions</a>
              <a href="#process" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-800 hover:text-cyan-400">Process</a>
              <button className="w-full text-left block px-3 py-2 rounded-md text-base font-medium bg-cyan-900/30 text-cyan-400 mt-4">
                Get a Quote
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div className="mb-12 lg:mb-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 mr-2 animate-pulse"></span>
                Web3 & Blockchain Engineering
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Enterprise-Grade <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                  Blockchain & MLM
                </span> <br />
                Software Solutions
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl leading-relaxed">
                We engineer secure, automated, and audit-ready Web3 platforms. 
                From complex smart contracts to high-performance MLM payout engines, 
                we deliver technology built for scale and compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2">
                  Book Free Consultation <ArrowRight size={18} />
                </button>
                <button className="bg-transparent border border-slate-700 hover:border-slate-500 text-white px-8 py-4 rounded-sm font-semibold transition-all duration-200">
                  View Case Studies
                </button>
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-800 flex items-center gap-8 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-cyan-500" /> Audited Code
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-cyan-500" /> Global Deployment
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-cyan-500" /> Enterprise Security
                </div>
              </div>
            </div>

            {/* Visual Placeholder for 3D/Dashboard Graphic */}
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-sm aspect-video flex items-center justify-center group">
                {/* Simulated Dashboard UI */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 opacity-90"></div>
                <div className="relative z-10 text-center p-8">
                  <div className="w-16 h-16 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 text-cyan-400">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Automated Payout Engine</h3>
                  <p className="text-slate-400 text-sm">Processing 10,000+ transactions per second with 100% accuracy.</p>
                </div>
                
                {/* Floating Elements Animation */}
                <div className="absolute top-10 right-10 p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs font-mono text-green-400">Smart Contract Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Eliminate Risk. Automate Success.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              The blockchain industry is plagued by insecure code and manual processes. We solve this with mathematical precision.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* The Problem */}
            <div className="p-8 rounded-lg border border-red-900/30 bg-red-950/10">
              <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <X size={20} /> Common Industry Pitfalls
              </h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span>Manual calculations leading to payout errors and user distrust.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span>Vulnerable smart contracts prone to re-entrancy attacks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                  <span>Lack of real-time reporting for admins.</span>
                </li>
              </ul>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-lg border border-cyan-500/30 bg-cyan-950/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full"></div>
              <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} /> The Nexus Advantage
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <span><strong>100% Automated</strong> calculation engine running 24/7.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <span><strong>Audit-Ready</strong> architecture built on verified standards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                  <span><strong>Live Analytics Dashboard</strong> with role-based access control.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Core Competencies</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Layers size={32} />,
              title: "Blockchain Development",
              desc: "Custom Layer-1 and Layer-2 solutions, forks, and consensus mechanism implementation."
            },
            {
              icon: <Code size={32} />,
              title: "Smart Contract Engineering",
              desc: "Secure, gas-optimized contracts for tokens, staking, vesting, and complex logic."
            },
            {
              icon: <BarChart3 size={32} />,
              title: "MLM Software Suite",
              desc: "Turnkey platforms for Binary, Matrix, Unilevel, and Hybrid compensation plans."
            },
            {
              icon: <Server size={32} />,
              title: "dApp Development",
              desc: "Full-stack Web3 applications connecting frontend interfaces to on-chain logic."
            },
            {
              icon: <ShieldCheck size={32} />,
              title: "Security Audits",
              desc: "Comprehensive vulnerability assessment and formal verification of your codebase."
            },
            {
              icon: <Globe size={32} />,
              title: "Crypto Integration",
              desc: "Payment gateways, custodial and non-custodial wallet systems, and token swaps."
            }
          ].map((service, idx) => (
            <div key={idx} className="group p-8 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 bg-slate-800 rounded-lg flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{service.desc}</p>
              <a href="#" className="text-cyan-500 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Know More <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* MLM Deep Dive */}
      <section id="mlm-solutions" className="py-20 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Specialized MLM Architectures</h2>
              <p className="text-slate-400 mb-8">
                We don't just use templates. We build custom calculation engines tailored to your specific business logic, supporting both crypto and fiat workflows.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Investment & ROI Plans</h4>
                    <p className="text-slate-400 text-sm mt-1">Staking logic, daily ROI tracking, pool distribution, and principal return mechanisms.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Product-Based Structures</h4>
                    <p className="text-slate-400 text-sm mt-1">E-commerce integration with Binary, Unilevel, or Matrix generation logic.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <Cpu size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Hybrid Smart Contracts</h4>
                    <p className="text-slate-400 text-sm mt-1">Decentralized execution of payouts directly to user wallets via smart contracts.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full min-h-[400px] bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-2xl">
                {/* Abstract visualization of a network tree */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-cyan-500 rounded-full mx-auto shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center justify-center text-white font-bold mb-8 relative z-10">Admin</div>
                        <div className="grid grid-cols-2 gap-12 relative z-10">
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-0.5 bg-slate-700 mb-2"></div>
                                <div className="w-12 h-12 bg-slate-800 border border-cyan-500/50 rounded-full flex items-center justify-center text-slate-300">A</div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                     <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full"></div>
                                     <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="h-8 w-0.5 bg-slate-700 mb-2"></div>
                                <div className="w-12 h-12 bg-slate-800 border border-cyan-500/50 rounded-full flex items-center justify-center text-slate-300">B</div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                     <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full"></div>
                                     <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Connecting lines SVG overlay would go here */}
                    </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 p-4 rounded border border-slate-700 backdrop-blur">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 uppercase font-bold">Total Network Volume</span>
                        <span className="text-cyan-400 font-mono font-bold">$2,450,290.00</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 w-3/4 h-full"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack - Simplified */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-b border-slate-800">
         <p className="text-slate-500 text-sm uppercase tracking-widest mb-8">Powering Solutions With</p>
         <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Text placeholders for logos */}
             <span className="text-xl font-bold text-slate-300">Ethereum</span>
             <span className="text-xl font-bold text-slate-300">Binance Smart Chain</span>
             <span className="text-xl font-bold text-slate-300">Polygon</span>
             <span className="text-xl font-bold text-slate-300">Solidity</span>
             <span className="text-xl font-bold text-slate-300">React.js</span>
             <span className="text-xl font-bold text-slate-300">Node.js</span>
         </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-800">
                <h2 className="text-3xl font-bold text-white mb-6">Let's Build Something Scalable.</h2>
                <p className="text-slate-400 mb-8">
                  Share your requirements. Our technical team will review your project and provide a confidential consultation within 24 hours.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-cyan-400">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Chat with us</div>
                      <div className="font-semibold">WhatsApp Support</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-cyan-400">
                      <Lock size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Privacy Guarantee</div>
                      <div className="font-semibold">100% Confidential (NDA Available)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 lg:p-16 bg-slate-900/50">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                      <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="Nexus Ltd" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="john@example.com" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Project Type</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors">
                        <option>MLM Software</option>
                        <option>dApp Development</option>
                        <option>Smart Contract Audit</option>
                        <option>Crypto Exchange</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Budget Range</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors">
                        <option>$5k - $10k</option>
                        <option>$10k - $25k</option>
                        <option>$25k - $50k</option>
                        <option>$50k+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Project Details</label>
                    <textarea className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors h-32" placeholder="Tell us about your requirements..."></textarea>
                  </div>

                  <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded transition-all duration-200 shadow-lg">
                    Send Requirements
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-900 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <span className="font-bold text-xl text-white block mb-4">NEXUS CHAIN</span>
              <p className="mb-4">Enterprise blockchain solutions built for the future of finance.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-cyan-400">MLM Software</a></li>
                <li><a href="#" className="hover:text-cyan-400">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-cyan-400">DApp Development</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-cyan-400">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400">Portfolio</a></li>
                <li><a href="#" className="hover:text-cyan-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-cyan-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-cyan-400">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-900 pt-8 text-center text-slate-600">
            <p>&copy; 2024 Nexus Chain Labs. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Sticky Whatsapp Button */}
      <a href="#" className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-400 transition-all z-50">
        <MessageSquare size={24} />
      </a>
    </div>
  );
};

export default LandingPage;