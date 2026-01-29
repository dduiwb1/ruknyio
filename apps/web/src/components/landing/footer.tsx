"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

const links = {
  product: [
    { label: "الفورما", href: "/forms" },
    { label: "المتجر", href: "/store" },
    { label: "الفعاليات", href: "/events" },
  ],
  company: [
    { label: "من نحن", href: "/about" },
    { label: "المدونة", href: "/blog" },
    { label: "تواصل معنا", href: "/contact" },
  ],
  legal: [
    { label: "الخصوصية", href: "/privacy" },
    { label: "الشروط", href: "/terms" },
  ],
};

const socials = [
  { icon: Github, href: "https://github.com/rukny", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com/rukny", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/rukny", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/company/rukny", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold">Rukny<span className="text-primary">.io</span></span>
            </Link>
            <p className="text-sm text-muted-foreground">
              منصة متكاملة لإنشاء حضورك الرقمي
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">المنتج</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">الشركة</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">قانوني</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rukny.io
          </p>
          
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <social.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
