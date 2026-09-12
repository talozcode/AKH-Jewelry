import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5" style={{ boxShadow: "var(--admin-shadow)" }}>
      <h2 className="font-display text-lg text-[var(--admin-text)]">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--admin-text-muted)]">{children}</div>
    </div>
  );
}

/**
 * A plain-language "how do I..." reference, written for the actual owner
 * (non-technical) rather than as developer documentation. Built per her
 * explicit ask for the admin to be friendlier; linked from the Sidebar so
 * it's always one tap away.
 */
export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[var(--admin-text)]">Help</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
          Quick answers for the things you&apos;ll do most often here.
        </p>
      </div>

      <Section title="Add a new piece">
        <p>
          Go to <strong>Products</strong> and press <strong>+ New product</strong>. Fill in the
          name, price, description and photos, then press <strong>Create product</strong>.
        </p>
        <p>It won&apos;t show up on the website unless &quot;Published&quot; is checked.</p>
      </Section>

      <Section title="Mark something sold out, or back in stock">
        <p>
          Open the piece from the <strong>Products</strong> list, change <strong>Availability</strong>,
          then press <strong>Save changes</strong>.
        </p>
        <p>
          For one-of-a-kind pieces you don&apos;t need to do this by hand when they sell - the site
          flips them to Out of Stock on its own the moment someone buys them.
        </p>
      </Section>

      <Section title="Change a price, description, or photos">
        <p>
          Open the piece from the <strong>Products</strong> list, make the change, and press{" "}
          <strong>Save changes</strong>. It appears on the live site within a few seconds.
        </p>
        <p>
          Under <strong>Photos</strong>: use <strong>+ Add photo</strong> to upload one, and the
          arrows under each photo to reorder them. The first photo is the one customers see first.
        </p>
      </Section>

      <Section title="Edit the words on a page (About, FAQ, Shipping, Terms...)">
        <p>
          Go to <strong>Pages</strong>, choose the page, edit the text, and press{" "}
          <strong>Save changes</strong>. This is also where the Terms of Sale and Privacy Policy live.
        </p>
      </Section>

      <Section title="Replace or remove a photo in the Media library">
        <p>
          <strong>Media</strong> is separate from a product&apos;s own photos - it holds images used
          elsewhere on the site (like page headers). Deleting one there asks you to confirm first,
          same as everywhere else.
        </p>
      </Section>

      <Section title="An order came in - what do I do?">
        <p>
          Go to <strong>Orders</strong> to see it. Once you&apos;ve shipped it, change its status to{" "}
          <strong>shipped</strong> so it stops showing as needing attention.
        </p>
        <p>
          If a customer needs their money back, press <strong>Refund</strong> on that order - it
          refunds them automatically through Stripe. You&apos;ll be asked to confirm before anything happens.
        </p>
        <p>
          If a row says <strong>Oversold</strong>, it means the piece sold out at the exact same
          moment someone else bought it too - reach out to that customer directly. After a refund on
          a piece marked Out of Stock, you&apos;ll be offered a one-tap link to relist it if it&apos;s
          actually still available.
        </p>
      </Section>

      <Section title="Something looks wrong, or you're not sure what to do">
        <p>
          Check the <strong>Dashboard</strong> first - it shows the shop&apos;s current totals at a
          glance. If you&apos;re ever unsure whether a change is safe, it&apos;s always fine to stop and ask
          before doing anything else.
        </p>
        <p>
          Nothing important can be undone by accident: deleting a product, a collection, or a photo,
          removing a photo from a product, and issuing a refund all ask you to confirm first, in
          plain language.
        </p>
      </Section>
    </div>
  );
}
