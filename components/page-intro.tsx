"use client";

import { useEffect, useState } from "react";
import { Btn } from "./ui";
import { Icon } from "./icons";

/**
 * One-time intro shown the first time a user lands on a section. Remembered per
 * section on the device, so it only appears once. Mirrors the welcome tour's
 * look. Dismiss with "Got it", the X, Escape, or clicking the backdrop.
 */
export function PageIntro({ id, tag, title, body }: { id: string; tag: string; title: string; body: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("sessionly_intro_" + id)) {
        const t = setTimeout(() => setOpen(true), 450);
        return () => clearTimeout(t);
      }
    } catch {
      /* localStorage unavailable; just don't show */
    }
  }, [id]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem("sessionly_intro_" + id, "1");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={close} />
      <div className="relative bg-surface rounded-[16px] shadow-2xl w-full max-w-md p-6">
        <button onClick={close} className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-[#F2F2EF] flex items-center justify-center text-faint hover:text-ink">
          <Icon.x className="w-4 h-4" />
        </button>
        <div className="text-[12px] font-semibold text-accent uppercase tracking-wide">{tag}</div>
        <h2 className="text-lg font-semibold mt-1 pr-6">{title}</h2>
        <p className="text-[14px] text-muted leading-relaxed mt-2">{body}</p>
        <div className="flex justify-end mt-5">
          <Btn size="sm" onClick={close}>Got it</Btn>
        </div>
      </div>
    </div>
  );
}
