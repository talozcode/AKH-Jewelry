// Hand-written to match the supabase/migrations/*.sql files exactly (no
// Supabase CLI in this environment to auto-generate: keep this in sync by
// hand whenever a migration changes). Shape (Row/Insert/Update/
// Relationships per table, Views/Functions on the schema) matches what
// @supabase/supabase-js's GenericSchema/GenericTable require to type the
// query builder correctly: see node_modules/@supabase/supabase-js's
// bundled type defs if this ever needs re-deriving.

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: "Rings" | "Necklaces" | "Bracelets";
          price: number;
          currency: "ILS" | "USD";
          material: string;
          stone: string | null;
          measurements: string;
          weight: string | null;
          available_sizes: string[] | null;
          availability: "In Stock" | "Made to Order" | "Out of Stock";
          dispatch: string;
          limited_edition: string | null;
          images: string[];
          tagline: string;
          description: string;
          story: string;
          craftsmanship: string;
          care: string;
          is_featured: boolean;
          is_hero: boolean;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["products"]["Row"],
            | "slug"
            | "name"
            | "category"
            | "price"
            | "currency"
            | "material"
            | "measurements"
            | "availability"
            | "dispatch"
            | "tagline"
            | "description"
            | "story"
            | "craftsmanship"
            | "care"
          >;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      pages: {
        Row: {
          key: string;
          content: Record<string, unknown>;
          updated_at: string;
        };
        Insert: {
          key: string;
          content?: Record<string, unknown>;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pages"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          contact_email: string;
          contact_phone: string | null;
          whatsapp_number: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          footer_blurb: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]> &
          Pick<Database["public"]["Tables"]["site_settings"]["Row"], "id" | "contact_email" | "footer_blurb">;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          intro: string;
          hero_image_url: string;
          hero_image_alt: string;
          story: string;
          product_slugs: string[];
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["collections"]["Row"],
            "slug" | "name" | "tagline" | "intro" | "hero_image_url" | "hero_image_alt" | "story"
          >;
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          product_id: string | null;
          product_name: string;
          product_slug: string;
          product_price: number;
          product_currency: string;
          size: string | null;
          customer_name: string;
          customer_email: string;
          shipping_line1: string;
          shipping_line2: string | null;
          shipping_city: string;
          shipping_state: string | null;
          shipping_postal_code: string;
          shipping_country: string;
          stripe_checkout_session_id: string;
          stripe_payment_intent_id: string | null;
          amount_total: number;
          currency: string;
          status: "unfulfilled" | "shipped";
          anonymized_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["orders"]["Row"],
            | "product_name"
            | "product_slug"
            | "product_price"
            | "product_currency"
            | "customer_name"
            | "customer_email"
            | "shipping_line1"
            | "shipping_city"
            | "shipping_postal_code"
            | "shipping_country"
            | "stripe_checkout_session_id"
            | "amount_total"
            | "currency"
          >;
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          url: string;
          storage_path: string;
          filename: string;
          uploaded_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["media_assets"]["Row"]> &
          Pick<Database["public"]["Tables"]["media_assets"]["Row"], "url" | "storage_path" | "filename">;
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
