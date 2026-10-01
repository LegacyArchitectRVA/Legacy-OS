"use client";

import { useState } from "react";

const steps = [
  { title: "Welcome to Legacy OS", body: "This is where your Life Manual actually lives. Give it a few minutes and we'll show you where everything goes." },
  { title: "Your Profile", body: "Confirm your name and the basics first. Everything else builds outward from here." },
  { title: "Seven Chapters", body: "Your record is organized into the same seven chapters as your Life Manual, each with its own information, gaps, and next actions." },
  { title: "Continuity Readiness", body: "See what's covered and what's still open at a glance, so you always know what's left to do." },
  { title: "You're set", body: "Add evidence as you go, and Legacy Recall will keep track of what's confirmed versus what's still a guess." },
];

type OrientationTourProps = { onComplete?: () => void };

export default function OrientationTour({ onComplete }: OrientationTourProps) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  function next() {
    if (step === steps.length - 1) {
      sessionStorage.setItem("legacyos.orientation.complete", "1");
      onComplete?.();
      return;
    }
    setStep((value) => value + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[#e7b84b]/40 bg-[#0b0b0b] p-7 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#e7b84b]/50 bg-[#171208] text-xl text-[#f0c85a]">L</div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#e7b84b]">Legacy OS</p>
            <h2 className="mt-2 font-serif text-2xl">{current.title}</h2>
          </div>
        </div>
        <p className="mt-6 text-base leading-7 text-white/65">{current.body}</p>
        <div className="mt-7 flex gap-1">
          {steps.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-[#e7b84b]" : "bg-white/10"}`} />)}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0} className="rounded-lg px-4 py-2 text-sm text-white/45 disabled:opacity-20">Back</button>
          <button onClick={next} className="rounded-lg bg-[#b98a25] px-5 py-2.5 text-sm font-semibold text-black">{step === steps.length - 1 ? "Enter my OS" : "Next"}</button>
        </div>
      </div>
    </div>
  );
}
