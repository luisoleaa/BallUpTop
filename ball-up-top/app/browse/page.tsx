// Thin server wrapper around BrowseClient, which does all the actual
// filtering/search/rendering (needs client-side state, so it's split out).
import { BrowseClient } from "@/components/browse/BrowseClient";

export default function BrowsePage() {
  return <BrowseClient />;
}
