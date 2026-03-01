import React from "react";
import { User, Mail, ArrowLeft } from "lucide-react";

export default function Form1() {
  return (
    <form className="flex flex-col items-center text-sm text-slate-800">
      <p className="text-xs bg-indigo-200 text-indigo-600 font-medium px-3 py-1 rounded-full">
        تواصل معنا
      </p>
      <h1 className="text-4xl font-bold py-4 text-center">
        دعنا نتواصل معك
      </h1>
      <p className="max-md:text-sm text-gray-500 pb-10 text-center">
        أو تواصل معنا مباشرة عبر{" "}
        <a href="#" className="text-indigo-600 hover:underline">
          hello@rukny.io
        </a>
      </p>

      <div className="max-w-96 w-full px-4">
        <label htmlFor="name" className="font-medium">
          الاسم الكامل
        </label>
        <div className="flex items-center mt-2 mb-4 h-11 pr-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
          <User className="size-5 text-slate-600 shrink-0" />
          <input
            type="text"
            className="h-full px-2 w-full outline-none bg-transparent"
            placeholder="أدخل اسمك الكامل"
            required
          />
        </div>

        <label htmlFor="email-address" className="font-medium mt-4">
          البريد الإلكتروني
        </label>
        <div className="flex items-center mt-2 mb-4 h-11 pr-3 border border-slate-300 rounded-full focus-within:ring-2 focus-within:ring-indigo-400 transition-all overflow-hidden">
          <Mail className="size-5 text-slate-600 shrink-0" />
          <input
            type="email"
            dir="ltr"
            className="h-full px-2 w-full outline-none bg-transparent text-left"
            placeholder="example@email.com"
            required
          />
        </div>

        <label htmlFor="message" className="font-medium mt-4">
          الرسالة
        </label>
        <textarea
          rows={4}
          className="w-full mt-2 p-3 bg-transparent border border-slate-300 rounded-2xl resize-none outline-none focus:ring-2 focus-within:ring-indigo-400 transition-all"
          placeholder="اكتب رسالتك هنا..."
          required
        ></textarea>

        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 mt-5 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 w-full rounded-full transition font-medium"
        >
          إرسال الرسالة
          <ArrowLeft className="size-5 mt-0.5" />
        </button>
      </div>
    </form>
  );
}
