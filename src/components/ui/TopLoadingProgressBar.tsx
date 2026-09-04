'use client';

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoadingProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = () => {
    setVisible(true);
    setProgress((prev) => (prev > 0 && prev < 90 ? prev : 25));

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 88) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          return 88;
        }
        return prev + Math.floor(Math.random() * 12 + 4);
      });
    }, 200);
  };

  const finishLoading = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 250);
    }, 200);
  };

  // Trigger on route changes
  useEffect(() => {
    startLoading();
    const timeout = setTimeout(() => {
      finishLoading();
    }, 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Trigger on global API requests
  useEffect(() => {
    const handleApiLoading = (e: any) => {
      const { isLoading } = e.detail || {};
      if (isLoading) {
        startLoading();
      } else {
        finishLoading();
      }
    };

    window.addEventListener("api_loading_change", handleApiLoading);
    return () => {
      window.removeEventListener("api_loading_change", handleApiLoading);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(244,63,94,0.75)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
