import { cache } from "react";
import { supabaseAdmin } from "./supabase/server";
import { STOCK } from "./stockImages";

export type PageKey =
  | "home"
  | "story"
  | "bespoke"
  | "faq"
  | "shipping-returns"
  | "care"
  | "size-guide"
  | "contact"
  | "terms";

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Homepage",
  story: "Our Story",
  bespoke: "Bespoke",
  faq: "FAQ",
  "shipping-returns": "Shipping & Returns",
  care: "Jewelry Care",
  "size-guide": "Size Guide",
  contact: "Contact",
  terms: "Terms & Privacy",
};

export type HomeContent = {
  heroHeadline: string;
  heroSubhead: string;
  heroCtaPrimaryLabel: string;
  heroCtaSecondaryLabel: string;
  sectionHeadingSelectedPieces: string;
  editorialImageUrl: string;
  editorialImageAlt: string;
  studioStoryHeading: string;
  studioStoryBody: string;
  studioStoryCtaLabel: string;
  nameMeaningEyebrow: string;
  nameMeaningBody: string;
  closingCtaLabel: string;
};

export type StoryContent = {
  heroHeadline: string;
  heroImageUrl: string;
  heroImageAlt: string;
  bodyProse: string;
  closingHeading: string;
  closingCtaLabel: string;
};

export type BespokeContent = {
  heroHeadline: string;
  heroImageUrl: string;
  heroImageAlt: string;
  steps: { title: string; body: string }[];
  closingHeading: string;
  closingBody: string;
  closingCtaLabel: string;
};

export type FaqContent = {
  items: { question: string; answer: string }[];
};

export type SectionsContent = {
  heading: string;
  sections: { heading: string; body: string }[];
};

export type SimpleListContent = {
  heading: string;
  intro: string;
  rules: string[];
};

export type SizeGuideContent = {
  heading: string;
  intro: string;
  sizes: { eu: string; circumference: string }[];
  closingBody: string;
};

export type SimpleProseContent = {
  heading: string;
  intro?: string;
  bodyProse: string;
};

export type PageContentMap = {
  home: HomeContent;
  story: StoryContent;
  bespoke: BespokeContent;
  faq: FaqContent;
  "shipping-returns": SectionsContent;
  care: SimpleListContent;
  "size-guide": SizeGuideContent;
  contact: SimpleProseContent;
  terms: SimpleProseContent;
};

export type PageContent<K extends PageKey = PageKey> = PageContentMap[K];

// Exact current hardcoded copy, transcribed byte-for-byte — this is both
// (a) the fallback merged under any missing/partial DB value in getPage(),
// and (b) the one-time seed source (scripts/seed-pages.ts). Keeping seed
// and fallback as the same object means there is no copy/paste drift
// between "what got seeded" and "what renders if a field is ever missing."
export const DEFAULTS: PageContentMap = {
  home: {
    heroHeadline: "objects of light.",
    heroSubhead: "Jewelry shaped by transformation, time and the beauty of imperfection.",
    heroCtaPrimaryLabel: "Shop collection →",
    heroCtaSecondaryLabel: "Our story",
    sectionHeadingSelectedPieces: "Selected pieces",
    editorialImageUrl: STOCK.brandStoryProcess,
    editorialImageAlt: "",
    studioStoryHeading: "A studio, not a factory",
    studioStoryBody:
      "AKH is a one-studio jewelry practice working in sterling silver and gold, set with hand-selected stones. Every piece is carved, cast, set and finished on the same bench, in small batches rather than continuous production — quiet objects, made slowly, meant to be worn for years.",
    studioStoryCtaLabel: "Read the full story",
    nameMeaningEyebrow: "The name",
    nameMeaningBody:
      "In Ancient Egypt, akh named the part of a person that becomes radiant and enduring — light, transformation, permanence. AKH borrows the feeling, not the imagery: pieces meant to last, worn until they carry their own history.",
    closingCtaLabel: "Shop the collection",
  },
  story: {
    heroHeadline: "One studio. One bench. Every piece made by hand.",
    heroImageUrl: STOCK.brandStoryProcess,
    heroImageAlt: "Setting a stone by hand at the studio bench",
    bodyProse: [
      "AKH is a one-studio jewelry practice, founded to make pieces that mean something to the person wearing them, not just to the market they're sold into.",
      "Every design starts as a hand-carved wax model on the same bench where it will later be cast, set and finished. There is no design software between the idea and the object, and no factory between the studio and the customer.",
      "Materials are chosen deliberately: sterling silver and 9–18k gold, set with stones sourced directly — including Nigerian emeralds, sapphires and garnets selected one at a time. Larger stones carry independent CGRL certification.",
      "What makes the process distinctive is its scale. Pieces are made in small, numbered batches, and one-of-one settings are built around a single stone and never repeated once it's gone.",
    ].join("\n\n"),
    closingHeading: "Have a question about a piece, or an idea for one?",
    closingCtaLabel: "hello@akhjewelry.com",
  },
  bespoke: {
    heroHeadline: "A piece made only for you.",
    heroImageUrl: STOCK.bespokeEditorial,
    heroImageAlt: "",
    steps: [
      { title: "Share your idea", body: "Email hello@akhjewelry.com with the meaning, occasion or reference behind the piece." },
      { title: "Select materials and stones", body: "Choose metal and stone from our sourced selection, or bring your own stone to be set." },
      { title: "Approve the design", body: "Review a hand-drawn concept and a 3D render before any metal is cast." },
      { title: "Your piece is handcrafted", body: "Carved, cast, set and finished on our bench, then shipped with its own care card." },
    ],
    closingHeading: "Ready to begin?",
    closingBody: "Bespoke commissions typically take 3–5 weeks from approved design to delivery, depending on stone availability.",
    closingCtaLabel: "Begin a bespoke piece",
  },
  faq: {
    items: [
      { question: "Who makes AKH jewelry?", answer: "Every piece is made by hand in a single studio, from a hand-carved wax model through casting, setting and finishing." },
      { question: "Are the materials genuine?", answer: "Yes. We use sterling silver and 9–18k gold, set with genuine stones including Nigerian emeralds and white sapphires, hand-selected by the studio. Larger stones are independently certified (CGRL)." },
      { question: "How do I find my ring size?", answer: "See our size guide, or email hello@akhjewelry.com with a ring you already own that fits and we'll help you match it." },
      { question: "When will my order ship?", answer: "In-stock pieces ship in 1–4 business days. Made-to-order and bespoke pieces take 3–4 weeks; the exact estimate is shown on each product page." },
      { question: "Can I return a piece?", answer: "In-stock pieces can be returned within 14 days in unworn condition. Made-to-order and one-of-one pieces are final sale, as noted on the product page." },
      { question: "Is checkout secure?", answer: "Yes — payments are processed securely at checkout. Online checkout is launching soon; in the meantime, email hello@akhjewelry.com to reserve a piece." },
      { question: "What if my piece needs repair?", answer: "Email hello@akhjewelry.com with photos of the issue. Studio-made pieces are covered for manufacturing defects for 12 months." },
    ],
  },
  "shipping-returns": {
    heading: "Shipping & Returns",
    sections: [
      {
        heading: "Shipping",
        body: "In-stock pieces ship within 1–4 business days. Made-to-order and bespoke pieces are handcrafted after your order is placed and typically ship in 3–4 weeks; each product page shows its exact estimate.",
      },
      {
        heading: "International orders",
        body: "We ship worldwide. International orders may be subject to local customs duties and import taxes, charged by your country on delivery and not included in the checkout price.",
      },
      {
        heading: "Returns",
        body: "In-stock pieces can be returned within 14 days of delivery in unworn, original condition for a full refund. Made-to-order and one-of-one pieces are final sale, since they are built around a specific size or stone.",
      },
    ],
  },
  care: {
    heading: "Caring for your piece",
    intro: "Each product page includes care notes specific to that piece's metal and stone. A few general rules:",
    rules: [
      "Remove jewelry before swimming, showering, exercise or manual work.",
      "Apply perfume and lotion before putting jewelry on, not after.",
      "Polish silver with a soft jewelry cloth; avoid abrasive cleaners.",
      "Store pieces separately to prevent scratching, ideally in the pouch they arrived in.",
      "Softer stones (emerald, opal) should never go in an ultrasonic cleaner.",
    ],
  },
  "size-guide": {
    heading: "Ring size guide",
    intro:
      "AKH rings are sized to EU standard: the size number is your finger's circumference in millimeters. Wrap a strip of paper around your finger, mark where it overlaps, and measure the length against the chart below. Most rings are cast to one size; email hello@akhjewelry.com before ordering if you need a different one.",
    sizes: [
      { eu: "48", circumference: "48mm" },
      { eu: "51", circumference: "51mm" },
      { eu: "54", circumference: "54mm" },
      { eu: "56", circumference: "56mm" },
      { eu: "60", circumference: "60mm" },
    ],
    closingBody: "Still unsure? Email hello@akhjewelry.com with a ring you own that fits and we'll help you match it.",
  },
  contact: {
    heading: "Get in touch",
    intro: "For orders, bespoke enquiries, press or repairs, email the studio directly — we read and reply to every message ourselves.",
    bodyProse: "Studio based in Israel. Bespoke consultations available by video call on request.",
  },
  terms: {
    heading: "Terms & Privacy",
    bodyProse: [
      "This page will host AKH's full terms of service and privacy policy ahead of launch, covering order terms, made-to-order and one-of-one sale conditions, and how customer data is collected and used.",
      "Questions in the meantime can be sent to hello@akhjewelry.com.",
    ].join("\n\n"),
  },
};

/**
 * Shallow-merges the DB row's content over DEFAULTS[key], so a missing or
 * partial jsonb value never crashes rendering — matches getHeroProduct()'s
 * existing fall-back-to-something-sane pattern in products.ts.
 */
export const getPage = cache(async function getPage<K extends PageKey>(key: K): Promise<PageContent<K>> {
  const { data, error } = await supabaseAdmin().from("pages").select("content").eq("key", key).maybeSingle();
  if (error) throw new Error(`getPage(${key}): ${error.message}`);
  return { ...DEFAULTS[key], ...(data?.content as Partial<PageContent<K>> | undefined) };
});

/** Admin only — call `requireAdminAction()` before this. */
export async function updatePage<K extends PageKey>(key: K, content: PageContent<K>): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("pages")
    .upsert({ key, content: content as Record<string, unknown> }, { onConflict: "key" });
  if (error) throw new Error(`updatePage(${key}): ${error.message}`);
}
