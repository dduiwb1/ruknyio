"use client";

/**
 * 📦 Top Products Table Component
 * جدول المنتجات الأكثر مبيعاً - تصميم متناسق
 */

import { motion } from "framer-motion";
import { Package, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

interface TopProductsTableProps {
  products?: TopProduct[];
  formatCurrency?: (amount: number) => string;
}

const defaultProducts: TopProduct[] = [
  { id: "1", name: "قميص رجالي كلاسيك", price: 79490, quantity: 82, amount: 6518180 },
  { id: "2", name: "بنطلون جينز", price: 128500, quantity: 37, amount: 4754500 },
  { id: "3", name: "تيشيرت قطني", price: 39990, quantity: 64, amount: 2559360 },
  { id: "4", name: "جاكيت خفيف", price: 20000, quantity: 184, amount: 3680000 },
];

function defaultFormatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} IQD`;
}

// تحديد لون الترتيب
const rankColors = [
  "bg-warning text-warning-foreground",      // #1
  "bg-muted text-muted-foreground",           // #2
  "bg-warning/60 text-warning-foreground",    // #3
  "bg-muted/60 text-muted-foreground",        // #4+
];

export function TopProductsTable({
  products = defaultProducts,
  formatCurrency = defaultFormatCurrency,
}: TopProductsTableProps) {
  const totalAmount = products.reduce((sum, p) => sum + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="overflow-hidden rounded-4xl border border-border/50 bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Package className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">المنتجات الأكثر مبيعاً</h3>
            <p className="text-xs text-muted-foreground">أفضل {products.length} منتجات أداءً</p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-xs font-semibold text-warning">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 border-b border-border/30">
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                #
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                المنتج
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                السعر
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                الكمية
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-muted-foreground">
                المبلغ
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="border-b border-border/20 last:border-0 transition-colors hover:bg-muted/30 group"
              >
                {/* Rank */}
                <td className="px-5 py-4">
                  <span className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold",
                    rankColors[index] || rankColors[3]
                  )}>
                    {index + 1}
                  </span>
                </td>
                
                {/* Product Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                
                {/* Price */}
                <td className="px-5 py-4 text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(product.price)}
                </td>
                
                {/* Quantity */}
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-info/10 text-info text-sm font-semibold tabular-nums">
                    {product.quantity}
                  </span>
                </td>
                
                {/* Amount */}
                <td className="px-5 py-4">
                  <span className="text-sm font-bold tabular-nums text-success">
                    {formatCurrency(product.amount)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function TopProductsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-7 w-24 rounded-lg bg-muted animate-pulse hidden sm:block" />
      </div>
      <div className="p-5">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-7 w-7 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse flex-1" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              <div className="h-6 w-12 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
