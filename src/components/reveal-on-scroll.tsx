"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Lightweight, dependency-free scroll-reveal wrapper built on the native
// IntersectionObserver API. Renders its own div (carrying `className`) so it
// can be dropped in place of an existing wrapper element without changing
// layout. Respects prefers-reduced-motion by skipping the animation and
// rendering content visible immediately.
export function RevealOnScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
