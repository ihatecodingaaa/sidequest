import { WifiOff } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Mark } from "@/components/layout/wordmark";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="sq-app-bg grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <Mark className="mx-auto size-12" />
        <WifiOff aria-hidden className="mx-auto mt-6 size-8 text-faint" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-chalk">You are offline</h1>
        <p className="mt-2 text-sm text-mist">
          Missions you have already opened still work. Anything that links out to an official
          service needs a connection.
        </p>
        <ButtonLink href="/" className="mt-6" size="lg">
          Back to Home
        </ButtonLink>
      </div>
    </div>
  );
}
