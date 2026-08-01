'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required contact fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message has been received! Railway customer support will contact you.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white py-16 px-6 text-center relative">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-400/30 mb-4 inline-block">
            Customer Support & Assistance
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Contact Sri Lanka Railways
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Have questions regarding train timetables, ticket cancellations, or e-ticket issues? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Left Column: Contact Cards */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Railway Hotline</h4>
              <p className="text-xs text-slate-500 mb-1 font-mono">Dial 1981 (24/7 Hotline)</p>
              <p className="text-xs text-slate-400">+94 11 2434215 (HQ Desk)</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Email Inquiries</h4>
              <p className="text-xs text-slate-500 mb-1">support@railway.gov.lk</p>
              <p className="text-xs text-slate-400">tickets@railway.gov.lk</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Headquarters Office</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sri Lanka Railways Department, <br />
                P.O. Box 355, Olcott Mawatha, <br />
                Colombo Fort 01000, Sri Lanka.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Send Customer Message</h2>
              <p className="text-xs text-slate-500">We respond to passenger inquiries within 24 hours.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Your Full Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. Nimal Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  placeholder="e.g. nimal@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Inquiry Subject</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                placeholder="e.g. E-Ticket QR issue / Schedule clarification"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Message Content *</label>
              <textarea
                rows={5}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                placeholder="Write your inquiry message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60 mt-2"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
