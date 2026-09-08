import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { InteractiveBloodMap } from '../../components/map/InteractiveBloodMap';
import { EmergencyRequestModal } from '../../components/emergency/EmergencyRequestModal';
import { CompatibilityMatrixModal } from '../../components/common/CompatibilityMatrixModal';
import { AIAssistantWidget } from '../../components/ai/AIAssistantWidget';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import {
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Building,
  Activity,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  Droplet,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);

  const handleDemoLogin = async (role: any) => {
    await loginAsDemo(role);
    navigate(`/${role.toLowerCase()}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-crimson-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-900">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-crimson-600/20 via-rose-600/15 to-transparent blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* North Star Metric Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-crimson-950/80 border border-crimson-700/60 text-crimson-300 text-xs font-bold mb-6 shadow-lg shadow-crimson-950/50 animate-bounce">
            <span className="flex h-2 w-2 rounded-full bg-crimson-400 animate-ping"></span>
            <span>NORTH STAR METRIC: Average Emergency Time-To-Match &lt; 3.0 Minutes</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Connecting Blood. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-400 via-rose-400 to-crimson-500">
              Saving Lives.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            LifeLink connects patients, hospitals, blood banks, and eligible donors through one intelligent emergency blood network to eliminate critical transfusion delays.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-crimson-900/50 flex items-center gap-2.5 transition transform active:scale-95"
            >
              <HeartPulse className="w-5 h-5 animate-pulse" />
              <span>REQUEST BLOOD NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/register"
              className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-crimson-400" />
              <span>Become a LifeLink Donor</span>
            </Link>
          </div>

          {/* Quick 1-Click Demo Sandbox */}
          <div className="mt-12 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-3xl mx-auto backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              ⚡ Instant 1-Click Interactive Demo Portals:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { role: 'DONOR', label: 'Star Donor (O-)', color: 'border-crimson-700/60 hover:bg-crimson-950/40 text-crimson-300' },
                { role: 'PATIENT', label: 'Patient Attendant', color: 'border-blue-700/60 hover:bg-blue-950/40 text-blue-300' },
                { role: 'HOSPITAL', label: 'Trauma Hospital', color: 'border-emerald-700/60 hover:bg-emerald-950/40 text-emerald-300' },
                { role: 'BLOOD_BANK', label: 'Red Cross Bank', color: 'border-purple-700/60 hover:bg-purple-950/40 text-purple-300' },
                { role: 'ADMIN', label: 'Platform Admin', color: 'border-amber-700/60 hover:bg-amber-950/40 text-amber-300' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleDemoLogin(item.role)}
                  className={`py-2 px-2.5 rounded-xl border bg-slate-950/60 font-bold transition flex flex-col items-center justify-center gap-0.5 ${item.color}`}
                >
                  <span className="text-[10px] uppercase">{item.role}</span>
                  <span className="text-[11px] text-white truncate max-w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Geolocation Radar Section */}
      <section className="py-16 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Live Emergency Response Network</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Active medical facilities, verified blood stock, and anonymized donor clusters within Metropolis
            </p>
          </div>

          <InteractiveBloodMap />
        </div>
      </section>

      {/* How LifeLink Works */}
      <section id="how-it-works" className="py-16 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-400">Step-by-Step Workflow</span>
            <h2 className="text-3xl font-black text-white mt-1">How LifeLink Eliminates Transfusion Delays</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From emergency broadcast creation to verified hospital transfusion in under 30 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Create Emergency Broadcast',
                desc: 'Patient, hospital, or attendant submits blood group, required units, and destination hospital.',
                icon: HeartPulse,
              },
              {
                step: '02',
                title: 'AI Progressive Matching',
                desc: 'Scoring engine ranks compatible donors within 5 km to 25 km based on compatibility, distance, and availability.',
                icon: Zap,
              },
              {
                step: '03',
                title: '1-Click Donor Response',
                desc: 'Compatible donors receive high-priority alerts and accept with instant hospital check-in code.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Verified Transfusion',
                desc: 'Hospital verifies donation in real-time, completing the request and awarding LifePoints to the donor.',
                icon: Award,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-crimson-600/50 transition duration-300 relative group"
                >
                  <span className="text-4xl font-black text-slate-800 group-hover:text-crimson-900/40 transition absolute top-4 right-5">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-crimson-950 border border-crimson-800/60 flex items-center justify-center text-crimson-400 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Decision Support & Shortage Forecasting Showcase */}
      <section id="ai-engine" className="py-16 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-950 border border-crimson-700/60 text-crimson-300 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Clinical Intelligence</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight">
                Predictive Blood Shortage Forecasts &amp; Multi-Factor Donor Scoring
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-4 leading-relaxed">
                LifeLink utilizes real-time inventory aggregation and historical demand models to forecast blood group deficits before emergencies strike.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Multi-factor donor ranking: Compatibility (40%), Distance (25%), Availability (15%), Eligibility (10%), Response probability (10%).',
                  'Progressive radius escalation from 5 km to 50 km city-wide if insufficient local donors respond.',
                  'Automated shortage alert broadcasts when rare blood groups (O-, AB-) fall below minimum safe days of supply.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsCompModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <Droplet className="w-4 h-4 text-crimson-400" />
                  Explore Compatibility Engine
                </button>
              </div>
            </div>

            {/* AI Decision Card Mockup */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-crimson-600/20 border border-crimson-500/40 flex items-center justify-center text-crimson-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Live AI Shortage Forecast</h4>
                    <span className="text-[10px] text-slate-400">Metropolis Regional Central Blood Bank</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crimson-950 text-crimson-400 border border-crimson-700">
                  HIGH DEFICIT RISK
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge group="O-" size="sm" />
                    <div>
                      <span className="font-bold text-white block">O- Negative Reserve</span>
                      <span className="text-[10px] text-crimson-400">Current Stock: 2 Units (1.2 days left)</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-crimson-400">Risk: 94%</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BloodGroupBadge group="A+" size="sm" />
                    <div>
                      <span className="font-bold text-white block">A+ Positive Reserve</span>
                      <span className="text-[10px] text-emerald-400">Current Stock: 28 Units (7.5 days left)</span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">Risk: 18%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                🤖 AI Recommendation: "Broadcast targeted mobile donation alert to 14 registered O- donors within 10 km."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="py-14 bg-slate-900/50 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: '2.4 Min', label: 'Average Time-to-Match' },
              { val: '1,840+', label: 'Verified Transfusions' },
              { val: '98.6%', label: 'Emergency Response Rate' },
              { val: '35+', label: 'Hospitals & Blood Banks' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-crimson-400 to-rose-400 block">
                  {stat.val}
                </span>
                <span className="text-xs text-slate-400 font-semibold mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-400">FAQ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {[
              {
                q: 'How does LifeLink protect donor privacy?',
                a: 'LifeLink never exposes exact donor GPS coordinates. We calculate distance server-side using the Haversine formula and present safe approximate distances (e.g. "~3.2 km away"). Phone numbers and identities are only shared after a donor explicitly confirms acceptance.',
              },
              {
                q: 'What is the LifePoints and Gamification system?',
                a: 'LifePoints (+500 for donation, +750 for emergency response) recognize our hero donors with badges and community leaderboards. We ensure gamification never pressures medically ineligible donors.',
              },
              {
                q: 'How is blood compatibility verified?',
                a: 'LifeLink implements medically validated ABO and Rh antigen compatibility matrices compliant with AABB and WHO standards. Hospitals perform crossmatching before any transfusion is administered.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-crimson-400 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Modals */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <CompatibilityMatrixModal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        defaultGroup="O-"
      />

      <AIAssistantWidget />
      <Footer />
    </div>
  );
};
