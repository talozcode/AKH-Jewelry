/**
 * The admin's server actions catch raw exceptions - Postgres constraint
 * violations bubbling up through supabase-js, Stripe API errors, network/
 * JWT failures - and used to hand `err.message` straight to the UI. That
 * meant a technophobic owner could see something like
 * `duplicate key value violates unique constraint "products_slug_key"`
 * after a routine save. This maps the common, recognizable failure shapes
 * to a plain-English sentence and falls back to one generic, reassuring
 * message for everything else, rather than ever showing raw driver/API
 * text on screen.
 *
 * Deliberately NOT applied to error strings the actions construct
 * themselves (e.g. "Enter an email address", "Order not found") - those
 * are already written for a human and would only get worse being routed
 * through pattern-matching meant for driver output.
 */
export function friendlyDbError(raw: string): string {
  const m = raw.toLowerCase();

  if (m.includes("duplicate key value violates unique constraint")) {
    if (m.includes("slug")) return "That web address is already used by another item - try a different one.";
    if (m.includes("email")) return "That email address is already in use.";
    return "Something with that name or web address already exists - try a different one.";
  }
  if (m.includes("violates not-null constraint")) {
    return "A required field is missing - check that everything is filled in and try again.";
  }
  if (m.includes("violates foreign key constraint")) {
    return "This item is connected to something else, so it can't be removed while that's still linked to it.";
  }
  if (m.includes("violates check constraint")) {
    return "One of the values entered isn't allowed - double check the numbers and try again.";
  }
  if (m.includes("jwt") || m.includes("fetch failed") || m.includes("econnrefused") || m.includes("timeout") || m.includes("network")) {
    return "The connection timed out. Reload the page and try again.";
  }

  return "Something went wrong saving this. Try again, and if it keeps happening, let Tal know.";
}
