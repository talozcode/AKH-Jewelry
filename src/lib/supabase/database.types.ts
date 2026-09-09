// Hand-written to match supabase/migrations/0001_init.sql exactly (no
// Supabase CLI in this environment to auto-generate — keep this in sync by
// hand whenever the migration changes). Shape (Row/Insert/Update/
// Relationships per table, Views/Functions on the schema) matches what
// @supabase/supabase-js's GenericSchema/GenericTable require to type the
// query builder correctly — see node_modules/@supabase/supabase-js's
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
      reservations: {
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
          customer_phone: string;
          message: string | null;
          status: "new" | "contacted" | "fulfilled" | "cancelled";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["reservations"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["reservations"]["Row"],
            | "product_name"
            | "product_slug"
            | "product_price"
            | "product_currency"
            | "customer_name"
            | "customer_email"
            | "customer_phone"
          >;
        Update: Partial<Database["public"]["Tables"]["reservations"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "reservations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
