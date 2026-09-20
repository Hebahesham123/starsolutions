import { notFound } from 'next/navigation';

/** A miss under /ar. More specific than the English catch-all at the root, so
 *  an Arabic reader who mistypes stays in Arabic. See that file for why this
 *  is a page rather than an `app/not-found.tsx`. */
export default function ArabicCatchAll(): never {
  notFound();
}
