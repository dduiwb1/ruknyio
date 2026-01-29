"use client";

import { cn } from "@/lib/utils";
import { Marquee } from "./marquee";

const reviews = [
  {
    name: "أحمد محمد",
    username: "@ahmed_dev",
    body: "منصة رائعة جداً، ساعدتني في تنظيم فعالياتي بشكل احترافي. أنصح بها بقوة!",
    img: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "فاطمة العلي",
    username: "@fatima_design",
    body: "التصميم جميل والواجهة سهلة الاستخدام. تجربة ممتازة للمبتدئين والمحترفين.",
    img: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "المهندس مصطفى عمار",
    username: "@ruknyio",
    body: "كمدير العام لشركة تقنية، أجد هذه المنصة أداة لا غنى عنها لتنظيم وإدارة الفعاليات.",
    img: "https://i.pravatar.cc/150?img=3",},
  {
    name: "عمر السالم",
    username: "@omar_tech",
    body: "أفضل منصة لإدارة الملفات الشخصية. الميزات متطورة والدعم ممتاز.",
    img: "https://i.pravatar.cc/150?img=8",
  },
  {
    name: "نور الدين",
    username: "@noor_events",
    body: "استخدمتها لتنظيم مؤتمر كبير وكانت النتائج مذهلة. أداة لا غنى عنها!",
    img: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "ليلى حسن",
    username: "@layla_creative",
    body: "كمبدعة محتوى، هذه المنصة وفرت لي الكثير من الوقت والجهد. شكراً!",
    img: "https://i.pravatar.cc/150?img=9",
  },
  {
    name: "محمود رشيد",
    username: "@mahmoud_startup",
    body: "ساعدتني في إطلاق شركتي الناشئة بطريقة احترافية. أنصح جميع رواد الأعمال بها.",
    img: "https://i.pravatar.cc/150?img=15",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-4 mx-2",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full" width="40" height="40" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm leading-relaxed">{body}</blockquote>
    </figure>
  );
};

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 md:px-8">
      <div className="container max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            تجارب حقيقية من مستخدمين راضين عن خدماتنا
          </p>
        </div>

        {/* Marquee Reviews */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg">
          <Marquee className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse className="[--duration:20s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
        </div>
      </div>
    </section>
  );
}