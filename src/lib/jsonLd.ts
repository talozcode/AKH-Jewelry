/**
 * Safely serializes a JSON-LD object for a `<script type="application/
 * ld+json">` tag rendered via dangerouslySetInnerHTML. Plain JSON.stringify
 * does not escape "<", so admin-entered text (a product name/description,
 * with no length/character restriction in ProductForm) containing the
 * literal string "</script>" would close the script tag early and let
 * everything after it be parsed as live HTML - script injection on that
 * product page for every visitor. Escaping "<" to its unicode escape is
 * the same fix Next.js's own docs recommend for this exact pattern; it's
 * invisible to JSON.parse (which un-escapes < back to "<") and to
 * search engines' structured-data parsers.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
