export type Category = "Rings" | "Necklaces" | "Bracelets";

export type Availability = "In Stock" | "Made to Order" | "Out of Stock";

export type Product = {
  /** Supabase row id. Absent on the frozen legacy seed data (design-concepts only). */
  id?: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  currency: "ILS" | "USD";
  material: string;
  stone?: string;
  measurements: string;
  weight?: string;
  availableSizes?: string[];
  availability: Availability;
  dispatch: string;
  limitedEdition?: string;
  /** Real photography pulled from the live site, largest usable crop first. */
  images: string[];
  tagline: string;
  description: string;
  story: string;
  craftsmanship: string;
  care: string;
  /** Homepage "Selected pieces" grid. Owner-controlled via /admin. */
  isFeatured?: boolean;
  /** Homepage hero image — exactly one product should have this true. */
  isHero?: boolean;
  /** Unpublished products are hidden from the storefront but visible in /admin. */
  isPublished?: boolean;
};
