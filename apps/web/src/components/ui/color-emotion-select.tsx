"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ColorEmotionOption {
  value: string;
  label: string;
  color: string;
  emoji?: string;
}

interface ColorEmotionSelectProps {
  options: ColorEmotionOption[];
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  className?: string;
}

export const ColorEmotionSelect: React.FC<ColorEmotionSelectProps> = ({
  options,
  label,
  placeholder = "Select...",
  onChange,
  defaultValue,
  value,
  className,
}) => {
  return (
    <Select defaultValue={defaultValue} value={value} onValueChange={(v) => { if (v && onChange) onChange(v); }}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn("flex items-center gap-2")}
            >
              <span
                className="inline-block w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: option.color }}
              />
              {option.emoji && <span>{option.emoji}</span>}
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
