'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Monitor,
  Tablet,
  Smartphone,
  MapPin,
  Clock,
  Phone,
  Mail,
  Building,
  Send,
  Check,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export default function ContactPageBuilder() {
  const { showToast } = useToast();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'stores' | 'form' | 'hours' | 'social'>('stores');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [config, setConfig] = useState({
    pageTitle: 'Visit Our Ateliers & Concierge Desk',
    pageSubtitle: 'Experience our curated haute collections in person or connect with our master stylists.',
    notificationEmail: 'ammar.tanwar.dev@gmail.com',
    stores: [
      {
        city: 'Bengaluru Flagship Atelier',
        address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
        phone: '+91 82390 19096',
        hours: 'Mon-Sun: 11:00 AM – 9:00 PM',
      },
      {
        city: 'Mumbai Design Studio',
        address: 'Kala Ghoda Arts Precinct, Fort, Mumbai, Maharashtra 400001',
        phone: '+91 82390 19096',
        hours: 'Mon-Sat: 10:30 AM – 8:00 PM',
      },
    ],
    formSubjectOptions: [
      'Bespoke Bridal Appointment',
      'B2B Wholesale Inquiry',
      'Order Delivery & Exchange Assistance',
      'Press & Media Collaborations',
    ],
    showInteractiveMap: true,
  });

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Contact & Store Locator draft saved successfully!', 'success');
    }, 600);
  };

  const handlePublishLive = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      showToast('Contact & Store Locator published live to storefront!', 'success');
    }, 800);
  };

  const handleReset = () => {
    setConfig({
      pageTitle: 'Visit Our Ateliers & Concierge Desk',
      pageSubtitle: 'Experience our curated haute collections in person or connect with our master stylists.',
      notificationEmail: 'ammar.tanwar.dev@gmail.com',
      stores: [
        {
          city: 'Bengaluru Flagship Atelier',
          address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
          phone: '+91 82390 19096',
          hours: 'Mon-Sun: 11:00 AM – 9:00 PM',
        },
        {
          city: 'Mumbai Design Studio',
          address: 'Kala Ghoda Arts Precinct, Fort, Mumbai, Maharashtra 400001',
          phone: '+91 82390 19096',
          hours: 'Mon-Sat: 10:30 AM – 8:00 PM',
        },
      ],
      formSubjectOptions: [
        'Bespoke Bridal Appointment',
        'B2B Wholesale Inquiry',
        'Order Delivery & Exchange Assistance',
        'Press & Media Collaborations',
      ],
      showInteractiveMap: true,
    });
    showToast('Reset to default contact template', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              Visual Headless CMS
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Contact &amp; Store Locator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Contact &amp; Store Locator Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage physical retail boutique addresses, concierge email routing, operating hours, and inquiry forms.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Switcher */}
          <div className="flex items-center bg-[#161822] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg transition-all ${device === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg transition-all ${device === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg transition-all ${device === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={handlePublishLive}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>
        </div>
      </div>

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#121522] border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex border-b border-slate-800 pb-2 gap-1 overflow-x-auto text-xs">
            {[
              { id: 'stores', label: '1. Retail Boutiques' },
              { id: 'form', label: '2. Inquiry Form' },
              { id: 'hours', label: '3. Routing Email' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === t.id
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Stores */}
          {activeTab === 'stores' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="text-slate-400 font-medium">Configure Physical Retail Locations:</div>
              {config.stores.map((store, idx) => (
                <div key={idx} className="p-3 bg-[#0C0E17] rounded-xl border border-slate-800 space-y-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-bold block">Boutique Name</label>
                    <input
                      type="text"
                      value={store.city}
                      onChange={(e) => {
                        const updated = [...config.stores];
                        updated[idx].city = e.target.value;
                        setConfig({ ...config, stores: updated });
                      }}
                      className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-white text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase font-bold block">Full Address</label>
                    <input
                      type="text"
                      value={store.address}
                      onChange={(e) => {
                        const updated = [...config.stores];
                        updated[idx].address = e.target.value;
                        setConfig({ ...config, stores: updated });
                      }}
                      className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Phone</label>
                      <input
                        type="text"
                        value={store.phone}
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].phone = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] uppercase font-bold block">Hours</label>
                      <input
                        type="text"
                        value={store.hours}
                        onChange={(e) => {
                          const updated = [...config.stores];
                          updated[idx].hours = e.target.value;
                          setConfig({ ...config, stores: updated });
                        }}
                        className="w-full p-1.5 bg-[#161822] border border-slate-700 rounded text-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Form */}
          {activeTab === 'form' && (
            <div className="space-y-3 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Page Headline</label>
                <input
                  type="text"
                  value={config.pageTitle}
                  onChange={(e) => setConfig({ ...config, pageTitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Page Subtitle</label>
                <textarea
                  rows={2}
                  value={config.pageSubtitle}
                  onChange={(e) => setConfig({ ...config, pageSubtitle: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Hours & Routing */}
          {activeTab === 'hours' && (
            <div className="space-y-3.5 text-xs animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Destination Email for Inquiries</label>
                <input
                  type="email"
                  value={config.notificationEmail}
                  onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                  className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-white text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500">Customer messages submitted on `/contact` will be dispatched directly to this mailbox.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Reactive Device Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0A0C10] border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div className="w-full text-xs font-mono text-slate-400 flex items-center justify-between mb-3">
            <span>LIVE CONTACT PREVIEW</span>
            <span className="text-emerald-400 font-bold">● Active Store Locator</span>
          </div>

          <div
            className={`w-full transition-all duration-300 border border-slate-700/60 rounded-2xl overflow-hidden bg-[#0D0F18] p-4 sm:p-6 space-y-6 ${
              device === 'mobile' ? 'max-w-xs' : device === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Header Mock */}
            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                DIRECT BRAND ATELIER
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">{config.pageTitle}</h3>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">{config.pageSubtitle}</p>
            </div>

            {/* Store Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.stores.map((s, idx) => (
                <div key={idx} className="p-3.5 bg-[#141724] rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <Building className="w-3.5 h-3.5" />
                    <span>{s.city}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{s.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Mock */}
            <div className="p-4 bg-[#121522] rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                <span>Send a Direct Message to Our Stylists</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled
                  placeholder="Your Name"
                  className="p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
                />
                <input
                  type="email"
                  disabled
                  placeholder="Your Email Address"
                  className="p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
                />
              </div>
              <textarea
                disabled
                rows={2}
                placeholder="How may our concierge team assist your order or atelier visit?"
                className="w-full p-2 bg-[#0C0E17] border border-slate-700 rounded-lg text-[10px] text-slate-400"
              />
              <button
                type="button"
                disabled
                className="w-full py-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-bold text-xs rounded-xl shadow opacity-90 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message to {config.notificationEmail}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
