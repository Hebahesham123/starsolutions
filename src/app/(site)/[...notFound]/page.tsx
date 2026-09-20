import { notFound } from 'next/navigation';

/**
 * Every URL that matches nothing else, routed into the English site so it can
 * be answered with the site's own 404.
 *
 * This is a catch-all rather than `app/not-found.tsx` because there is no
 * `app/layout.tsx` any more: each locale group owns a root layout so `lang`
 * and `dir` can be static, and a top-level not-found has no layout above it to
 * supply `<html>` — Next rejects the build outright. Routed through a page
 * instead, the miss lands inside a group, picks up that group's root layout
 * and chrome, and `notFound()` hands it to the boundary beside this file with
 * a real 404 status.
 *
 * Named segments still win: `/solutions` matches its own route, not this one.
 * `/ar/<miss>` matches the Arabic copy of this, which is one segment deeper
 * and therefore more specific.
 */
export default function CatchAll(): never {
  notFound();
}
