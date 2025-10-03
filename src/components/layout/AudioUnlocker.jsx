"use client";
import { useEffect, useRef } from "react";

const AudioUnlocker = () => {
  const unlockedRef = useRef(false);
  const primedRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prime = async () => {
      if (unlockedRef.current) return;
      try {
        audioCtxRef.current =
          audioCtxRef.current ||
          new (window.AudioContext || window.webkitAudioContext)();
        await audioCtxRef.current.resume().catch(() => {});

        if (!primedRef.current) {
          const a = new window.Audio("/sound/notificaiton.wav");
          a.preload = "auto";
          a.volume = 0.85;
          primedRef.current = a;
        }

        primedRef.current.muted = true;
        await primedRef.current.play().catch(() => {});
        primedRef.current.pause();
        primedRef.current.currentTime = 0;
        primedRef.current.muted = false;

        // Expose globals so any component can use the unlocked resources
        window.__audioUnlocked = true;
        window.__audioCtx = audioCtxRef.current;
        window.__audioElement = primedRef.current;

        unlockedRef.current = true;
        removeAll();
      } catch {
        // ignore; will try again on next gesture
      }
    };

    const removeAll = () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("keydown", prime);
      window.removeEventListener("wheel", prime);
      window.removeEventListener("mousemove", prime);
      window.removeEventListener("focus", prime);
    };

    const opts = { passive: true };
    window.addEventListener("pointerdown", prime, opts);
    window.addEventListener("touchstart", prime, opts);
    window.addEventListener("keydown", prime, opts);
    window.addEventListener("wheel", prime, opts);
    window.addEventListener("mousemove", prime, opts);
    window.addEventListener("focus", prime, opts);

    return removeAll;
  }, []);

  return null;
};

export default AudioUnlocker;
