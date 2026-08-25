/**
 * Single source of truth for authoritative Singapore safety services.
 *
 * SIDEQUEST is the participation layer. It never receives crime reports and
 * never rebuilds an official service: every entry here hands the user off to
 * the agency that actually owns the job.
 *
 * All URLs and numbers below were checked against the live official sites.
 * Last verified: 2026-08-25.
 */

export type OfficialAction = "call" | "open";

export interface OfficialResource {
  id: string;
  label: string;
  description: string;
  /** What the user should expect after tapping. Keeps the handoff honest. */
  handoff: string;
  action: OfficialAction;
  href: string;
  displayTarget: string;
  owner: string;
  accent: "coral" | "quest" | "pulse" | "volt" | "gold";
  priority: "emergency" | "urgent" | "standard";
}

export const OFFICIAL_RESOURCES: readonly OfficialResource[] = [
  {
    id: "police-emergency",
    label: "Police emergency",
    description: "Someone is in danger, a crime is happening now, or you need urgent help.",
    handoff: "Dials 999 on your phone.",
    action: "call",
    href: "tel:999",
    displayTarget: "999",
    owner: "Singapore Police Force",
    accent: "coral",
    priority: "emergency",
  },
  {
    id: "scam-helpline",
    label: "ScamShield Helpline",
    description: "Talk to someone if you think you are being scammed, right now.",
    handoff: "Dials 1799, the 24-hour helpline.",
    action: "call",
    href: "tel:1799",
    displayTarget: "1799",
    owner: "ScamShield",
    accent: "gold",
    priority: "urgent",
  },
  {
    id: "scamshield",
    label: "ScamShield",
    description: "Block scam calls and messages, and check whether something is a known scam.",
    handoff: "Opens scamshield.gov.sg in your browser.",
    action: "open",
    href: "https://www.scamshield.gov.sg",
    displayTarget: "scamshield.gov.sg",
    owner: "ScamShield, a national anti-scam service",
    accent: "quest",
    priority: "standard",
  },
  {
    id: "police-hotline",
    label: "Police hotline",
    description: "Not an emergency, but you want to speak to the Police.",
    handoff: "Dials 1800 255 0000.",
    action: "call",
    href: "tel:1800-255-0000",
    displayTarget: "1800 255 0000",
    owner: "Singapore Police Force",
    accent: "pulse",
    priority: "standard",
  },
  {
    id: "i-witness",
    label: "I-Witness",
    description:
      "Share information about criminal or suspicious activity through the official Police channel.",
    handoff: "Opens the SPF I-Witness page. SIDEQUEST never takes the report itself.",
    action: "open",
    href: "https://www.police.gov.sg/iwitness",
    displayTarget: "police.gov.sg/iwitness",
    owner: "Singapore Police Force",
    accent: "pulse",
    priority: "standard",
  },
  {
    id: "police-eservices",
    label: "Police e-services",
    description: "File a report, check a case, or use other official Police services.",
    handoff: "Opens the SPF e-services directory. The Police@SG app is listed there too.",
    action: "open",
    href: "https://www.police.gov.sg/e-services",
    displayTarget: "police.gov.sg/e-services",
    owner: "Singapore Police Force",
    accent: "quest",
    priority: "standard",
  },
  {
    id: "spf-advisories",
    label: "Police advisories",
    description: "Read the current official advisories on crime and scam trends.",
    handoff: "Opens the SPF advisories page.",
    action: "open",
    href: "https://www.police.gov.sg/Advisories",
    displayTarget: "police.gov.sg/Advisories",
    owner: "Singapore Police Force",
    accent: "volt",
    priority: "standard",
  },
  {
    id: "ncpc",
    label: "National Crime Prevention Council",
    description: "Crime prevention programmes, resources and community initiatives.",
    handoff: "Opens ncpc.org.sg.",
    action: "open",
    href: "https://www.ncpc.org.sg",
    displayTarget: "ncpc.org.sg",
    owner: "National Crime Prevention Council",
    accent: "volt",
    priority: "standard",
  },
] as const;

export function getOfficialResource(id: string): OfficialResource | undefined {
  return OFFICIAL_RESOURCES.find((resource) => resource.id === id);
}

/** Convenience references used inside mission debriefs and Pulse detail pages. */
export const QUICK_LINKS = {
  scamShield: "https://www.scamshield.gov.sg",
  scamHelpline: "tel:1799",
  policeEmergency: "tel:999",
  iWitness: "https://www.police.gov.sg/iwitness",
  spfAdvisories: "https://www.police.gov.sg/Advisories",
  ncpc: "https://www.ncpc.org.sg",
  /**
   * meLISTEN is a single-page app that answers 200 to unknown paths, so station
   * deep links cannot be verified from outside. We link the verified root and
   * let the official player handle station selection.
   */
  meListen: "https://www.melisten.sg",
} as const;
