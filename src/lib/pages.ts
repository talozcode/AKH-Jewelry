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
  | "terms"
  | "privacy";

export const PAGE_LABELS: Record<PageKey, string> = {
  home: "Homepage",
  story: "Our Story",
  bespoke: "Bespoke",
  faq: "FAQ",
  "shipping-returns": "Shipping & Returns",
  care: "Jewelry Care",
  "size-guide": "Size Guide",
  contact: "Contact",
  terms: "Terms of Sale",
  privacy: "Privacy Policy",
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
  intro?: string;
  lastUpdated?: string;
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
  terms: SectionsContent;
  privacy: SectionsContent;
};

export type PageContent<K extends PageKey = PageKey> = PageContentMap[K];

// Exact current hardcoded copy, transcribed byte-for-byte: this is both
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
      "AKH is a one-studio jewelry practice working in sterling silver and gold, set with hand-selected stones. Every piece is carved, cast, set and finished on the same bench, in small batches rather than continuous production: quiet objects, made slowly, meant to be worn for years.",
    studioStoryCtaLabel: "Read the full story",
    nameMeaningEyebrow: "The name",
    nameMeaningBody:
      "In Ancient Egypt, akh named the part of a person that becomes radiant and enduring: light, transformation, permanence. AKH borrows the feeling, not the imagery: pieces meant to last, worn until they carry their own history.",
    closingCtaLabel: "Shop the collection",
  },
  story: {
    heroHeadline: "One studio. One bench. Every piece made by hand.",
    heroImageUrl: STOCK.brandStoryProcess,
    heroImageAlt: "Setting a stone by hand at the studio bench",
    bodyProse: [
      "AKH is a one-studio jewelry practice, founded to make pieces that mean something to the person wearing them, not just to the market they're sold into.",
      "Every design starts as a hand-carved wax model on the same bench where it will later be cast, set and finished. There is no design software between the idea and the object, and no factory between the studio and the customer.",
      "Materials are chosen deliberately: sterling silver and 9-18k gold, set with stones sourced directly, including Nigerian emeralds, sapphires and garnets selected one at a time. Larger stones carry independent CGRL certification.",
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
    closingBody: "Bespoke commissions typically take 3-5 weeks from approved design to delivery, depending on stone availability.",
    closingCtaLabel: "Begin a bespoke piece",
  },
  faq: {
    items: [
      { question: "Who makes AKH jewelry?", answer: "Every piece is made by hand in a single studio, from a hand-carved wax model through casting, setting and finishing." },
      { question: "Are the materials genuine?", answer: "Yes. We use sterling silver and 9-18k gold, set with genuine stones including Nigerian emeralds and white sapphires, hand-selected by the studio. Larger stones are independently certified (CGRL)." },
      { question: "How do I find my ring size?", answer: "See our size guide, or email hello@akhjewelry.com with a ring you already own that fits and we'll help you match it." },
      { question: "When will my order ship?", answer: "In-stock pieces ship in 1-4 business days. Made-to-order and bespoke pieces take 3-4 weeks; the exact estimate is shown on each product page." },
      { question: "Can I return a piece?", answer: "In-stock pieces can be returned within 14 days in unworn condition. Made-to-order and one-of-one pieces are final sale, as noted on the product page." },
      { question: "Is checkout secure?", answer: "Yes. Payments are processed securely through Stripe at checkout; card details never reach AKH's own servers." },
      { question: "What if my piece needs repair?", answer: "Email hello@akhjewelry.com with photos of the issue. Studio-made pieces are covered for manufacturing defects for 12 months." },
    ],
  },
  "shipping-returns": {
    heading: "Shipping & Returns",
    sections: [
      {
        heading: "Shipping",
        body: "In-stock pieces ship within 1-4 business days. Made-to-order and bespoke pieces are handcrafted after your order is placed and typically ship in 3-4 weeks; each product page shows its exact estimate.",
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
    intro: "For orders, bespoke enquiries, press or repairs, email the studio directly. We read and reply to every message ourselves.",
    bodyProse: "Studio based in Israel. Bespoke consultations available by video call on request.",
  },
  terms: {
    heading: "Terms of Sale",
    lastUpdated: "2026-09-11",
    sections: [
      {
        heading: "Who these terms are with",
        body: "These terms govern orders placed at akhjewelry.com, operated by [[LEGAL ENTITY NAME]] ([[COMPANY / VAT NUMBER]]), [[REGISTERED ADDRESS]] (\"AKH\", \"we\", \"us\"). By placing an order you agree to these terms. See our [Privacy Policy](/privacy) for how we handle your personal data.",
      },
      {
        heading: "Products and pricing",
        body: "Prices are shown in the currency you select at checkout and charge exactly as displayed, with no automatic tax added. Every piece is handmade, so natural variation in stone color, pattern and finish should be expected and is not a defect. If a price is displayed incorrectly, we'll contact you before dispatching your order rather than charging the wrong amount.",
      },
      {
        heading: "Placing an order",
        body: "Orders are placed through Stripe's secure hosted checkout. Your card details are handled entirely by Stripe and never reach AKH's own servers; see our [Privacy Policy](/privacy) for how Stripe fits into our data handling. You'll receive a payment receipt directly from Stripe once your payment is confirmed.",
      },
      {
        heading: "Made-to-order and bespoke pieces",
        body: "\"Made to Order\" pieces are standard catalog designs, handcrafted after you order in the size shown on the product page; dispatch timelines are shown on each product page and in our [Shipping & Returns](/shipping-returns) policy.\n\nBespoke commissions are different: they're designed with you, to your own chosen materials, stones and sizing, through our bespoke process. Once production begins on a bespoke commission, it cannot be cancelled or returned, since it's built to your personal specification and generally can't be resold as-is.\n\n[[LEGAL REVIEW: confirm the return and withdrawal treatment of standard-size Made to Order catalog pieces for EU consumers under the Consumer Rights Directive's \"made to the consumer's specifications or clearly personalised\" exemption before launch. A Made to Order reproduction of an existing catalog design, in a standard listed size, is a materially different case from a bespoke commission and may not qualify for the same final-sale treatment.]]",
      },
      {
        heading: "Shipping",
        body: "We currently ship worldwide with no shipping fee. International orders may be subject to customs duties or import taxes charged by your own country on delivery, which are not included in the checkout price. Full detail is in our [Shipping & Returns](/shipping-returns) policy.",
      },
      {
        heading: "Returns and refunds",
        body: "In-stock pieces can be returned within 14 days of delivery, unworn and in original condition, for a full refund.\n\nBespoke commissions are final sale once production has begun (see above). Made to Order catalog pieces are currently treated as final sale as well, subject to the legal review noted above.\n\nRefunds are currently processed manually by the studio through Stripe once a returned piece is received and inspected; email hello@akhjewelry.com to start a return.",
      },
      {
        heading: "Warranty",
        body: "Studio-made pieces are covered against manufacturing defects for 12 months from delivery. This doesn't cover normal wear, accidental damage, or work done by anyone other than AKH. Email hello@akhjewelry.com with photos of the issue.",
      },
      {
        heading: "Intellectual property",
        body: "Product photography, designs and the content of this site belong to [[LEGAL ENTITY NAME]] and may not be reproduced without permission.",
      },
      {
        heading: "Limitation of liability",
        body: "Nothing in these terms excludes or limits any liability that can't be excluded or limited under applicable law, including liability for fraud or for death or personal injury caused by negligence. Beyond that, our liability to you is limited to the amount you paid for the relevant order.",
      },
      {
        heading: "Your consumer rights",
        body: "Nothing in these terms affects your statutory rights as a consumer, including any right of withdrawal under the consumer protection law of your own country of residence.",
      },
      {
        heading: "Governing law",
        body: "These terms are governed by the laws of [[GOVERNING LAW JURISDICTION]], without prejudice to any mandatory consumer-protection law that applies in your own country of residence.",
      },
      {
        heading: "Changes to these terms",
        body: "We may update these terms from time to time; the date at the top of this page shows when they last changed.",
      },
      {
        heading: "Contact",
        body: "Questions about an order or these terms can be sent to [hello@akhjewelry.com](mailto:hello@akhjewelry.com).",
      },
    ],
  },
  privacy: {
    heading: "Privacy Policy",
    lastUpdated: "2026-09-11",
    intro: "This policy explains what personal data AKH collects when you shop at akhjewelry.com, why, and the rights you have over it, including under the EU/UK GDPR, the California CCPA/CPRA, and Israel's Privacy Protection Law.",
    sections: [
      {
        heading: "Who we are",
        body: "akhjewelry.com is operated by [[LEGAL ENTITY NAME]] ([[COMPANY / VAT NUMBER]]), [[REGISTERED ADDRESS]] (\"AKH\", \"we\", \"us\"), the data controller for the personal information described below.",
      },
      {
        heading: "What information we collect",
        body: "When you place an order we collect your name, email address, shipping address and the details of what you bought. If you email us, we keep that correspondence. Your card details are collected and processed directly by Stripe, our payment processor, and never reach AKH's own servers.",
      },
      {
        heading: "Cookies and tracking",
        body: "This site sets exactly one cookie, akh_admin, used only to keep the shop owner signed in to the admin area; it's never set for a visitor browsing or buying. We run no analytics, no advertising pixels, and no visitor tracking of any kind, and our fonts are self-hosted so your browser never contacts Google to load them. Because of that, this site doesn't need a cookie-consent banner today; if we ever add analytics or advertising tools, this policy and that requirement would both change first.",
      },
      {
        heading: "How we use your information",
        body: "We use your information to process and fulfill your order, to communicate with you about it, and to meet our own legal obligations such as tax record-keeping. If you email us with a question, we use your information to reply to you.",
      },
      {
        heading: "Who we share it with",
        body: "We share order information with the processors who run the shop on our behalf: Stripe (payment processing), Supabase (our database and file storage, hosted in Australia), and Vercel (website hosting; their server logs include visitor IP addresses for security and operational purposes). We do not sell or share your personal information with anyone for their own marketing purposes.",
      },
      {
        heading: "International data transfers",
        body: "Our database is hosted with Supabase in Australia, which does not have an adequacy decision from the European Commission. Where this involves data originating in the EU/UK, the transfer relies on Supabase's own data processing agreement and standard contractual clauses with us.",
      },
      {
        heading: "How long we keep your information",
        body: "We currently plan to retain order records for 7 years to meet our tax and accounting obligations. We'll erase or anonymize your personal details sooner at your request wherever we aren't legally required to keep them; see \"Your rights\" below.",
      },
      {
        heading: "Your rights under the GDPR (EEA / UK)",
        body: "If you're in the EEA or UK, you have the right to access, correct, delete, restrict, or port your personal data, and to object to how we use it, at any time. You also have the right to lodge a complaint with your local data protection authority. Our EU representative under Article 27 GDPR is [[EU REPRESENTATIVE NAME AND CONTACT DETAILS]].",
      },
      {
        heading: "Your rights under the CCPA/CPRA (California)",
        body: "AKH doesn't currently meet the revenue or volume thresholds that make the CCPA/CPRA legally binding on us, but we extend its core rights to every customer regardless of location: the right to know what we hold about you, the right to delete it, and the right to correct it. We don't sell or share personal information, so there's no opt-out of sale or sharing to exercise.",
      },
      {
        heading: "Your rights under Israeli law",
        body: "Under Israel's Privacy Protection Law, 5741-1981 (as amended), you have the right to review the information we hold about you and to request that it be corrected or deleted.",
      },
      {
        heading: "How to exercise your rights",
        body: "Email [[PRIVACY CONTACT EMAIL]] to make any of the requests above. We'll verify your identity using the email address on your order before acting on it, and we aim to respond within 30 days.",
      },
      {
        heading: "Children",
        body: "This site isn't directed at children, and we don't knowingly collect personal information from anyone under 16.",
      },
      {
        heading: "Changes to this policy",
        body: "We may update this policy from time to time; the date at the top of this page shows when it last changed.",
      },
      {
        heading: "Contact",
        body: "Questions about this policy can be sent to [[PRIVACY CONTACT EMAIL]] or [[LEGAL ENTITY NAME]], [[REGISTERED ADDRESS]].",
      },
    ],
  },
};

/**
 * Shallow-merges a DB row's content over DEFAULTS[key], so a missing or
 * partial jsonb value never crashes rendering: matches getHeroProduct()'s
 * existing fall-back-to-something-sane pattern in products.ts. Pure and
 * exported separately from getPage() so this merge behavior is testable
 * without a Supabase client (see pages.test.ts).
 */
export function mergePageContent<K extends PageKey>(key: K, dbContent: Partial<PageContent<K>> | undefined | null): PageContent<K> {
  return { ...DEFAULTS[key], ...(dbContent ?? undefined) };
}

export const getPage = cache(async function getPage<K extends PageKey>(key: K): Promise<PageContent<K>> {
  const { data, error } = await supabaseAdmin().from("pages").select("content").eq("key", key).maybeSingle();
  if (error) throw new Error(`getPage(${key}): ${error.message}`);
  return mergePageContent(key, data?.content as Partial<PageContent<K>> | undefined);
});

/** Admin only: call `requireAdminAction()` before this. */
export async function updatePage<K extends PageKey>(key: K, content: PageContent<K>): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("pages")
    .upsert({ key, content: content as Record<string, unknown> }, { onConflict: "key" });
  if (error) throw new Error(`updatePage(${key}): ${error.message}`);
}
