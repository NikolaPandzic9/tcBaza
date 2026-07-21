import { StudioClient } from "./StudioClient";

// The Studio is a client-side single-page app; force-static keeps this
// route out of the dynamic rendering/ISR machinery used by the public site.
export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioClient />;
}
