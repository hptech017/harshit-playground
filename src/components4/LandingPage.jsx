import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Shield, 
  Coins, 
  TrendingUp, 
  CheckCircle, 
  Star,
  Twitter,
  Github,
  MessageCircle,
  Mail,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [earnings, setEarnings] = useState({
    btc: 0.00123456,
    eth: 0.0234567,
    doge: 123.45,
    ltc: 0.0456789
  });

  // Simulate real-time earnings animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings(prev => ({
        btc: prev.btc + Math.random() * 0.00001,
        eth: prev.eth + Math.random() * 0.001,
        doge: prev.doge + Math.random() * 1,
        ltc: prev.ltc + Math.random() * 0.001
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const cryptoTokens = [
    { name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-400 to-orange-600', earnings: earnings.btc },
    { name: 'Ethereum', symbol: 'ETH', color: 'from-blue-400 to-blue-600', earnings: earnings.eth },
    { name: 'Dogecoin', symbol: 'DOGE', color: 'from-yellow-400 to-yellow-600', earnings: earnings.doge },
    { name: 'Litecoin', symbol: 'LTC', color: 'from-gray-400 to-gray-600', earnings: earnings.ltc },
    { name: 'Cardano', symbol: 'ADA', color: 'from-purple-400 to-purple-600', earnings: 45.67 },
    { name: 'Solana', symbol: 'SOL', color: 'from-green-400 to-green-600', earnings: 1.234 }
  ];

  const benefits = [
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Passive Income",
      description: "Earn crypto rewards 24/7 without any effort. Your virtual miners work around the clock."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Future of Mining",
      description: "Revolutionary virtual mining technology that's accessible to everyone, everywhere."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Eco-Friendly Virtual Mining",
      description: "Zero environmental impact. Mine cryptocurrencies without consuming electricity or hardware."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "No Hardware Required",
      description: "Skip the expensive mining rigs. Start mining instantly with our cloud-based platform."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter Miner",
      price: "$99",
      multiplier: "1.2x",
      features: ["Mine 4+ cryptocurrencies", "Basic mining speed", "24/7 mining", "Email support"],
      popular: false
    },
    {
      name: "Pro Miner",
      price: "$299",
      multiplier: "2.5x",
      features: ["Mine 8+ cryptocurrencies", "Enhanced mining speed", "Priority mining", "24/7 chat support", "Weekly reports"],
      popular: true
    },
    {
      name: "Ultimate Miner",
      price: "$599",
      multiplier: "5x",
      features: ["Mine 12+ cryptocurrencies", "Maximum mining speed", "Ultra priority mining", "Dedicated account manager", "Real-time analytics", "Custom mining strategies"],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Crypto Investor",
      content: "I've been mining with CryptoMine for 6 months and earned over $2,400 in passive income. The platform is incredibly user-friendly!",
      earnings: "$2,400+",
      avatar: "AC"
    },
    {
      name: "Sarah Johnson",
      role: "DeFi Enthusiast",
      content: "Finally, a mining platform that actually works! My Ultimate Miner has already paid for itself twice over.",
      earnings: "$1,850+",
      avatar: "SJ"
    },
    {
      name: "Mike Rodriguez",
      role: "Tech Entrepreneur",
      content: "The real-time rewards and multiple cryptocurrency mining make this the best investment I've made this year.",
      earnings: "$3,200+",
      avatar: "MR"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 opacity-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Mine the Future,<br />Earn Crypto Rewards Today!
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Start your crypto mining journey with our revolutionary virtual miners. Earn passive income from multiple cryptocurrencies without any hardware or technical knowledge.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
            Start Mining Now
          </button>
          
          {/* Real-time earnings ticker */}
          <div className="mt-12 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">Live Earnings Demo</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cryptoTokens.slice(0, 4).map((token) => (
                <div key={token.symbol} className="text-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${token.color} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {token.symbol[0]}
                  </div>
                  <p className="text-xs text-gray-400">{token.symbol}</p>
                  <p className="text-sm font-mono text-green-400">+{token.earnings.toFixed(6)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-400">Start earning in just 3 simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Buy a Virtual Miner", desc: "Choose from our range of powerful virtual mining rigs. No hardware setup required.", icon: <Coins className="w-12 h-12" /> },
            { step: "02", title: "Auto-Mine Multiple Tokens", desc: "Your miner automatically mines the most profitable cryptocurrencies 24/7.", icon: <Zap className="w-12 h-12" /> },
            { step: "03", title: "Earn Daily Rewards", desc: "Receive your crypto rewards directly in your wallet every day. It's that simple!", icon: <TrendingUp className="w-12 h-12" /> }
          ].map((item, index) => (
            <div key={index} className="relative group">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-6xl font-bold text-gray-700 mb-4">{item.step}</div>
                <div className="text-cyan-400 mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 z-10"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Token Showcase Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Mine Multiple Cryptocurrencies
            </h2>
            <p className="text-xl text-gray-400">Our virtual miners support all major cryptocurrencies</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {cryptoTokens.map((token, index) => (
              <div 
                key={token.symbol} 
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${token.color} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold group-hover:animate-pulse`}>
                  {token.symbol[0]}
                </div>
                <h3 className="font-bold text-lg mb-2">{token.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{token.symbol}</p>
                <p className="text-xs text-green-400 font-mono">+{typeof token.earnings === 'number' ? token.earnings.toFixed(6) : token.earnings}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Why Choose CryptoMine?
          </h2>
          <p className="text-xl text-gray-400">Experience the future of cryptocurrency mining</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 text-center">
              <div className="text-cyan-400 mb-4 flex justify-center">{benefit.icon}</div>
              <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
              <p className="text-gray-400 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-20 px-4 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Choose Your Mining Power
            </h2>
            <p className="text-xl text-gray-400">Select the perfect miner for your crypto journey</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-gray-700 hover:border-cyan-500/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">{plan.price}</div>
                  <div className="text-cyan-400 text-lg font-semibold">{plan.multiplier} Rewards</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white shadow-lg hover:shadow-cyan-500/25' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                }`}>
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-gray-400">See what our miners are earning</p>
        </div>
        
        <div className="relative">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                {testimonials[currentTestimonial].avatar}
              </div>
              <div>
                <h4 className="text-xl font-bold">{testimonials[currentTestimonial].name}</h4>
                <p className="text-gray-400">{testimonials[currentTestimonial].role}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold text-green-400">{testimonials[currentTestimonial].earnings}</div>
                <div className="text-sm text-gray-400">Total Earned</div>
              </div>
            </div>
            
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              "{testimonials[currentTestimonial].content}"
            </p>
          </div>
          
          <button 
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === currentTestimonial ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800/50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CryptoMine
              </h3>
              <p className="text-gray-400 text-sm">
                The future of cryptocurrency mining. Start your passive income journey today.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 CryptoMine. All rights reserved. Virtual mining platform for educational purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;