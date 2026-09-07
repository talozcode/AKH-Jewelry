"use client";

export function NewsletterForm() {
  return (
    <form className="flex w-full max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter"
        type="email"
        required
        placeholder="Join the studio list"
        className="w-full border-b border-ivory/30 bg-transparent py-2 text-sm placeholder:text-ivory/40 focus:border-copper-soft focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 border border-ivory/30 px-4 py-2 text-xs uppercase tracking-[0.14em] transition hover:border-copper-soft hover:text-copper-soft"
      >
        Sign up
      </button>
    </form>
  );
}
