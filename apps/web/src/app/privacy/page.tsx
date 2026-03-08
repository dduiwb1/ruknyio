"use client";

import Link from "next/link";
import { Shield, Lock, Eye, Database, UserCheck, Bell, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainHeader } from "@/components/layout/main-header";

const sections = [
  {
    id: "intro",
    title: "مقدمة",
    icon: Shield,
    content: `نحن في ركني نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام منصتنا.

نحن نؤمن بالشفافية الكاملة فيما يتعلق بممارساتنا المتعلقة بالبيانات، ونسعى جاهدين لضمان فهمك الكامل لكيفية تعاملنا مع معلوماتك.`,
  },
  {
    id: "data-collection",
    title: "البيانات التي نجمعها",
    icon: Database,
    content: `نقوم بجمع أنواع مختلفة من المعلومات لتقديم خدماتنا وتحسينها:

**المعلومات الشخصية:**
• الاسم الكامل وعنوان البريد الإلكتروني
• رقم الهاتف (اختياري)
• معلومات الملف الشخصي والصورة
• عنوان النشاط التجاري (إن وجد)

**معلومات الاستخدام:**
• سجلات الوصول
• نوع المتصفح والجهاز المستخدم
• الصفحات التي تزورها ومدة الزيارة
• التفاعلات مع المنصة

**معلومات المعاملات:**
• تفاصيل الطلبات والمشتريات
• معلومات الدفع (مشفرة ومحمية)
• سجل المعاملات`,
  },
  {
    id: "data-usage",
    title: "كيف نستخدم بياناتك",
    icon: Eye,
    content: `نستخدم المعلومات المجمعة للأغراض التالية:

**تقديم الخدمات:**
• إنشاء وإدارة حسابك
• معالجة الطلبات والمعاملات
• تقديم الدعم الفني

**تحسين التجربة:**
• تخصيص المحتوى والتوصيات
• تحليل أنماط الاستخدام لتحسين المنصة
• إجراء الأبحاث والتحليلات

**التواصل:**
• إرسال التحديثات والإشعارات المهمة
• الرد على استفساراتك وطلباتك
• إرسال العروض الترويجية (بموافقتك)`,
  },
  {
    id: "data-protection",
    title: "حماية البيانات",
    icon: Lock,
    content: `نتخذ إجراءات أمنية صارمة لحماية بياناتك:

**التشفير:**
• تشفير جميع البيانات أثناء النقل باستخدام SSL/TLS
• تشفير البيانات الحساسة في قواعد البيانات
• تشفير معلومات الدفع وفق معايير PCI DSS

**الوصول المحدود:**
• الوصول للبيانات مقتصر على الموظفين المصرح لهم
• استخدام المصادقة الثنائية للوصول الإداري
• مراجعات أمنية دورية

**النسخ الاحتياطي:**
• نسخ احتياطية يومية مشفرة
• خطط استعادة الكوارث
• مراكز بيانات آمنة ومعتمدة`,
  },
  {
    id: "user-rights",
    title: "حقوقك",
    icon: UserCheck,
    content: `لديك الحقوق التالية فيما يتعلق ببياناتك:

**حق الوصول:**
يمكنك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك.

**حق التصحيح:**
يمكنك تحديث أو تصحيح بياناتك الشخصية في أي وقت من خلال إعدادات حسابك.

**حق الحذف:**
يمكنك طلب حذف حسابك وجميع البيانات المرتبطة به، مع مراعاة المتطلبات القانونية.

**حق النقل:**
يمكنك طلب نقل بياناتك إلى خدمة أخرى بتنسيق قابل للقراءة.

**حق الاعتراض:**
يمكنك الاعتراض على معالجة بياناتك لأغراض تسويقية.`,
  },
  {
    id: "cookies",
    title: "ملفات تعريف الارتباط",
    icon: Globe,
    content: `نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين تجربتك:

**ملفات أساسية:**
• ضرورية لعمل المنصة بشكل صحيح
• تذكر تسجيل الدخول والتفضيلات
• لا يمكن تعطيلها

**ملفات تحليلية:**
• فهم كيفية استخدام الزوار للمنصة
• تحسين الأداء والوظائف
• يمكن تعطيلها

**ملفات تسويقية:**
• تخصيص الإعلانات والمحتوى
• قياس فعالية الحملات
• يمكن تعطيلها

يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح.`,
  },
  {
    id: "third-parties",
    title: "الأطراف الثالثة",
    icon: Globe,
    content: `قد نشارك بياناتك مع أطراف ثالثة موثوقة:

**مزودو الخدمات:**
• خدمات الاستضافة والبنية التحتية
• معالجات الدفع المعتمدة
• خدمات التحليلات

**الشركاء:**
• شركاء الشحن والتوصيل (للمتاجر)
• بوابات الدفع الإلكتروني

**المتطلبات القانونية:**
• الاستجابة للطلبات القانونية
• حماية حقوقنا وسلامة المستخدمين
• منع الاحتيال والأنشطة غير القانونية

نحن لا نبيع بياناتك الشخصية لأي طرف ثالث.`,
  },
  {
    id: "updates",
    title: "تحديثات السياسة",
    icon: Bell,
    content: `قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر:

• سنُعلمك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة
• التغييرات الطفيفة ستُنشر مباشرة على هذه الصفحة
• تاريخ آخر تحديث مذكور في أسفل الصفحة
• استمرارك في استخدام المنصة يعني موافقتك على التغييرات

ننصحك بمراجعة هذه الصفحة دورياً للاطلاع على أي تحديثات.`,
  },
  {
    id: "contact",
    title: "تواصل معنا",
    icon: Mail,
    content: `إذا كانت لديك أي أسئلة حول سياسة الخصوصية أو ممارساتنا المتعلقة بالبيانات:

**البريد الإلكتروني:**
support@rukny.io

**الدعم الفني:**
help@rukny.io
support@rukny.work

**العنوان:**
العراق - محافظة ميسان


نلتزم بالرد على جميع الاستفسارات خلال 48 ساعة عمل.`,
  },
];

export default function PrivacyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Header */}
      <MainHeader />

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="size-4" />
              خصوصيتك أولويتنا
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              سياسة الخصوصية
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              نحن ملتزمون بحماية خصوصيتك وضمان أمان بياناتك. اقرأ سياستنا لفهم كيفية تعاملنا مع معلوماتك.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              آخر تحديث: 1 فبراير 2026
            </p>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 border-b bg-muted/30 m-2 md:mx-4 rounded-4xl drop-shadow-lg">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto ">
            <h2 className="text-lg font-semibold mb-4">محتويات الصفحة</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-background border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
                >
                  <section.icon className="size-4 text-primary shrink-0" />
                  <span className="line-clamp-1">{section.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 sm:py-16">
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {sections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="scroll-mt-20"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      القسم {index + 1}
                    </span>
                    <h2 className="text-2xl font-bold">{section.title}</h2>
                  </div>
                </div>
                <div className="pr-16">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {section.content.split("\n\n").map((paragraph, pIndex) => (
                      <div key={pIndex} className="mb-4">
                        {paragraph.startsWith("**") ? (
                          <div>
                            {paragraph.split("\n").map((line, lIndex) => {
                              if (line.startsWith("**") && line.endsWith("**")) {
                                return (
                                  <h3
                                    key={lIndex}
                                    className="text-base font-semibold mt-4 mb-2"
                                  >
                                    {line.replace(/\*\*/g, "")}
                                  </h3>
                                );
                              }
                              if (line.startsWith("•")) {
                                return (
                                  <p
                                    key={lIndex}
                                    className="text-muted-foreground text-sm mr-4"
                                  >
                                    {line}
                                  </p>
                                );
                              }
                              return (
                                <p
                                  key={lIndex}
                                  className="text-muted-foreground text-sm"
                                >
                                  {line.replace(/\*\*/g, "")}
                                </p>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground leading-relaxed">
                            {paragraph}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {index < sections.length - 1 && (
                  <div className="mt-8 border-b" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ركني. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-primary transition-colors">
                شروط الاستخدام
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
