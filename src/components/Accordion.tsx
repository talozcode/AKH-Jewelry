"use client";

import { useState } from "react";

export function Accordion({ items }: { items: { title: string; content: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.title}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-sm uppercase tracking-[0.1em] text-ink">{item.title}</span>
              <span className="text-lg text-copper">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen ? (
              <p className="pb-5 text-sm leading-relaxed text-ink/70">{item.content}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
