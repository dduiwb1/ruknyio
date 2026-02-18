"use client";

import React from "react";
import { User, Mail, ArrowRight } from "lucide-react";

export default function ContactForm() {
  return (
    <form className="flex flex-col items-center text-sm text-slate-800 dark:text-slate-200">
      <p className="text-xs bg-primary/20 text-primary font-medium px-3 py-1 rounded-full">
        تواصل معنا
      </p>
      <h1 className="text-4xl font-bold py-4 text-center text-foreground">
        لنتواصل معك
      </h1>
      <p className="max-md:text-sm text-muted-foreground pb-10 text-center">
        أو تواصل معنا مباشرة على{" "}
        <a
          href="#"
          className="text-primary hover:underline transition-all"
        >
          hello@prebuiltui.com
        </a>
      </p>

      <div className="max-w-96 w-full px-4">
        <label htmlFor="name" className="font-semibold text-sm mb-2 block text-foreground">
          الاسم الكامل
        </label>
        <div className="flex items-center mt-2 mb-4 h-10 pl-3 border-2 border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden bg-background">
          <User className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <input
            type="text"
            id="name"
            className="h-full px-2 w-full outline-none bg-transparent text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="أدخل اسمك الكامل"
            required
          />
        </div>

        <label htmlFor="email-address" className="font-semibold text-sm mb-2 block text-foreground mt-4">
          البريد الإلكتروني
        </label>
        <div className="flex items-center mt-2 mb-4 h-10 pl-3 border-2 border-slate-300 dark:border-slate-600 rounded-full focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all overflow-hidden bg-background">
          <Mail className="h-5 w-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <input
            type="email"
            id="email-address"
            className="h-full px-2 w-full outline-none bg-transparent text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="أدخل بريدك الإلكتروني"
            required
          />
        </div>

        <label htmlFor="message" className="font-semibold text-sm mb-2 block text-foreground mt-4">
          الرسالة
        </label>
        <textarea
          rows={4}
          id="message"
          className="w-full mt-2 p-3 bg-background border-2 border-slate-300 dark:border-slate-600 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder="اكتب رسالتك هنا"
          required
        ></textarea>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 mt-5 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 w-full rounded-full transition-all font-semibold shadow-sm hover:shadow-md"
        >
          إرسال النموذج
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
