/**
 * Renders `[link text](url)` markdown-style links inline within plain text,
 * for legal-document body copy that needs to link Stripe's/Supabase's
 * policies and offer a `mailto:` without ever risking stored HTML.
 *
 * Deliberately NOT `dangerouslySetInnerHTML`: the admin is a single shared
 * password with no 2FA and no rate limiting (see src/lib/admin/auth.ts), so
 * storing raw HTML would turn an admin credential leak into stored XSS on a
 * page linked from the footer of every storefront page. Everything here
 * that isn't a matched `[text](url)` pair renders as a plain React text
 * node, so React escapes it and it can never emit a tag.
 *
 * The one real vector is a malicious href, e.g. `[x](javascript:alert(1))`.
 * Closed with `new URL()` plus a protocol allowlist rather than a
 * string-prefix check: the URL parser normalizes case, embedded whitespace
 * and percent-encoding before `.protocol` is read, which a hand-rolled
 * `href.startsWith("javascript:")` check would miss (e.g. "JaVaScRiPt:",
 * "\tjavascript:", "java\tscript:"). A rejected/unparseable href renders as
 * the original literal `[text](url)` text: visibly wrong to the admin who
 * typed it, harmless to the visitor.
 *
 * Legal-page copy also needs to link OTHER PAGES ON THIS SITE (e.g.
 * `[Privacy Policy](/privacy)`). A root-relative path (starts with "/" but
 * not "//") is accepted outright with no `new URL()` involved at all: a
 * string in that exact shape can never carry a scheme of its own, so
 * there's no `javascript:`-style vector to check for. Deliberately NOT
 * resolved via `new URL(url, someBase)`: that also accepts bare words like
 * "not a url" or an empty string (both resolve fine against a base, since
 * WHATWG URL treats anything without its own scheme as a relative path to
 * resolve), which would silently turn an admin's typo into a broken link
 * instead of the visibly-wrong literal text this component is designed to
 * fall back to. Everything else must be a genuine absolute URL, checked
 * with a base-less `new URL()` exactly as before.
 */
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const ALLOWED_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

export function safeHref(url: string): string | null {
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [full, label, url] = match;
    const index = match.index;

    if (index > lastIndex) nodes.push(text.slice(lastIndex, index));

    const href = safeHref(url);
    if (href) {
      nodes.push(
        <a key={key++} href={href} className="text-copper underline underline-offset-2" target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
          {label}
        </a>
      );
    } else {
      // Unrecognized/unsafe protocol: render the original bracket text
      // as-is rather than a link, so a bad admin edit is visible, not silent.
      nodes.push(full);
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <>{nodes}</>;
}
