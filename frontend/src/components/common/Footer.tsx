import React from 'react';
import { HeartPulse, Shield, Activity, PhoneCall, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-crimson-600 flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="text-base font-black text-white">LifeLink</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-Powered Smart Blood Donation & Emergency Response Platform. Reducing time-to-match during critical transfusion windows.
            </p>
            <div className="text-[11px] font-mono text-crimson-400 font-bold">
              Tagline: "Connecting Blood. Saving Lives."
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Platform</h5>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition">Emergency Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register as Donor / Hospital</Link></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How LifeLink Works</a></li>
              <li><a href="#ai-engine" className="hover:text-white transition">AI Matching Engine</a></li>
            </ul>
          </div>

          {/* Medical Integrity */}
          <div>
            <h5 className="font-bold text-white mb-3 uppercase tracking-wider text-[11px]">Medical Integrity</h5>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>AABB & WHO ABO Transfusion Standards</li>
              <li>Verified Hospital Identity Verification</li>
              <li>Progressive Radius Dispatch Protocol</li>
              <li>Strict Donor Geolocation Privacy</li>
            </ul>
          </div>

          {/* 24/7 Emergency Dispatch */}
          <div className="p-4 rounded-2xl bg-crimson-950/30 border border-crimson-800/40 space-y-2">
            <h5 className="font-bold text-crimson-400 flex items-center gap-1.5 text-xs">
              <PhoneCall className="w-3.5 h-3.5" /> 24/7 Emergency Hotline
            </h5>
            <p className="text-lg font-mono font-extrabold text-white">1-800-LIFELINK</p>
            <p className="text-[10px] text-slate-400 leading-tight">
              Hospital transfusion teams and emergency medical services priority routing.
            </p>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 LifeLink Platform. All rights reserved. LifeLink AI is an emergency decision support system and does not replace certified physician evaluation.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Guarantee</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Medical Advisory</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
