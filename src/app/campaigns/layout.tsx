import type { ReactNode } from "react";

/**
 * Campaign routes deliberately sit outside the (app) route group.
 *
 * The group's layout puts an onboarding gate in front of everything, which is
 * exactly wrong here: somebody scanning a QR at a roadshow has often never
 * opened SIDEQUEST before, and making them answer four onboarding questions
 * while standing at a station is how you lose them. Campaign pages decide
 * their own chrome, and a chapter runs immediately on a cold device.
 */
export default function CampaignsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
