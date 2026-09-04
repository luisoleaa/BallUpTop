// Thin server wrapper around BrowseClient, which does all the actual
// filtering/search/rendering (needs client-side state, so it's split out).
import type { Metadata } from "next";
import { BrowseClient } from "@/components/browse/BrowseClient";

export const metadata: Metadata = { title: "Browse matches" };

export default function BrowsePage() {
  return <BrowseClient />;
}
