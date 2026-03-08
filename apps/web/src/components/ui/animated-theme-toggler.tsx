"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type AnimatedThemeTogglerProps = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // تحميل الثيم عند بدء التطبيق
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme")
    const isDark = savedTheme === "dark" || document.documentElement.classList.contains("dark")
    setDarkMode(isDark)
  }, [])

  // مراقبة تغييرات الـ class
  useEffect(() => {
    const syncTheme = () =>
      setDarkMode(document.documentElement.classList.contains("dark"))

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const onToggle = useCallback(async () => {
    if (!buttonRef.current) return

    const toggled = !darkMode

    // التأثير الدائري (View Transitions API)
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        flushSync(() => {
          setDarkMode(toggled)
          document.documentElement.classList.toggle("dark", toggled)
          localStorage.setItem("theme", toggled ? "dark" : "light")
        })
      }).ready

      const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
      const centerX = left + width / 2
      const centerY = top + height / 2
      const maxDistance = Math.hypot(
        Math.max(centerX, window.innerWidth - centerX),
        Math.max(centerY, window.innerHeight - centerY)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${centerX}px ${centerY}px)`,
            `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
          ],
        },
        {
          duration: 400, // أسرع من 700ms
          easing: "ease-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    } else {
      // للمتصفحات التي لا تدعم View Transitions
      setDarkMode(toggled)
      document.documentElement.classList.toggle("dark", toggled)
      localStorage.setItem("theme", toggled ? "dark" : "light")
    }
  }, [darkMode])

  // لا تظهر شيء حتى يتم التحميل (تجنب hydration mismatch)
  if (!mounted) {
    return (
      <button
        className={cn(
          "flex items-center justify-center p-2 rounded-full w-9 h-9",
          className
        )}
        type="button"
      />
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      aria-label="تبديل الوضع"
      className={cn(
        "flex items-center justify-center p-2 rounded-full outline-none focus:outline-none active:outline-none focus:ring-0 cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span
            key="sun-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-yellow-500"
          >
            <Sun className="h-5 w-5" />
          </motion.span>
        ) : (
          <motion.span
            key="moon-icon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-700 dark:text-slate-300"
          >
            <Moon className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
