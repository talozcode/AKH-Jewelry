import { describe, expect, it } from "vitest";
import { friendlyDbError } from "./friendlyError";

describe("friendlyDbError", () => {
  it("names the slug specifically on a duplicate slug constraint", () => {
    const raw = `createProduct: duplicate key value violates unique constraint "products_slug_key"`;
    expect(friendlyDbError(raw)).toBe("That web address is already used by another item - try a different one.");
  });

  it("names the email specifically on a duplicate email constraint", () => {
    const raw = `insert: duplicate key value violates unique constraint "customers_email_key"`;
    expect(friendlyDbError(raw)).toContain("email address is already in use");
  });

  it("falls back to a generic duplicate message when the column isn't slug or email", () => {
    const raw = `duplicate key value violates unique constraint "collections_name_key"`;
    expect(friendlyDbError(raw)).toBe("Something with that name or web address already exists - try a different one.");
  });

  it("explains a missing required field on a not-null violation", () => {
    const raw = `updateProduct: null value in column "dispatch" of relation "products" violates not-null constraint`;
    expect(friendlyDbError(raw)).toContain("required field is missing");
  });

  it("explains a linked-record block on a foreign key violation", () => {
    const raw = `deleteCollectionAction: update or delete on table "collections" violates foreign key constraint`;
    expect(friendlyDbError(raw)).toContain("connected to something else");
  });

  it("explains a rejected value on a check constraint violation", () => {
    const raw = `createProduct: new row for relation "products" violates check constraint "products_price_check"`;
    expect(friendlyDbError(raw)).toContain("isn't allowed");
  });

  it("treats a JWT/network failure as a timed-out connection", () => {
    expect(friendlyDbError("getProducts: JWT issued at future")).toBe("The connection timed out. Reload the page and try again.");
    expect(friendlyDbError("fetch failed")).toBe("The connection timed out. Reload the page and try again.");
  });

  it("never echoes the raw driver text back for an unrecognized error", () => {
    const raw = `updateProduct: column "totaly_wrong_col" of relation "products" does not exist`;
    const friendly = friendlyDbError(raw);
    expect(friendly).not.toContain("totaly_wrong_col");
    expect(friendly).not.toContain("relation");
    expect(friendly).toBe("Something went wrong saving this. Try again, and if it keeps happening, let Tal know.");
  });
});
