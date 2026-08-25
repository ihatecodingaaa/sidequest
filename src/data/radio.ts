import type { RadioStation } from "@/types/content";
import { QUICK_LINKS } from "@/lib/official-links";

/**
 * Radio discovery.
 *
 * SIDEQUEST never restreams audio. Every station links out to meLISTEN, the
 * official Singapore listening service, which handles playback and rights.
 *
 * meLISTEN is a single-page app that answers 200 for unknown paths, so station
 * deep links cannot be verified from outside. We therefore send every station
 * to the verified meLISTEN root and let the official player take it from there.
 *
 * `isPartnerConfirmed` is false everywhere because no partnership exists.
 * Linking to a public service is not a partnership and the copy never says it is.
 */

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: "radio-987",
    name: "987",
    frequency: "98.7FM",
    language: "English",
    description: "Chart music and the station most 16 to 25s already have open.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "coral",
    isPartnerConfirmed: false,
  },
  {
    id: "radio-class95",
    name: "Class 95",
    frequency: "95.0FM",
    language: "English",
    description: "Talk and music through the commute.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "quest",
    isPartnerConfirmed: false,
  },
  {
    id: "radio-yes933",
    name: "YES 933",
    frequency: "93.3FM",
    language: "Mandarin",
    description: "Mandarin pop, and one of the widest daily reaches in Singapore.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "gold",
    isPartnerConfirmed: false,
  },
  {
    id: "radio-ria897",
    name: "RIA 89.7",
    frequency: "89.7FM",
    language: "Malay",
    description: "Malay music, culture and community conversation.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "volt",
    isPartnerConfirmed: false,
  },
  {
    id: "radio-oli968",
    name: "OLI 96.8",
    frequency: "96.8FM",
    language: "Tamil",
    description: "Tamil programming, music and talk.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "pulse",
    isPartnerConfirmed: false,
  },
  {
    id: "radio-money893",
    name: "MONEY FM 89.3",
    frequency: "89.3FM",
    language: "English",
    description: "Business and personal finance, including how scams move money.",
    officialUrl: QUICK_LINKS.meListen,
    platform: "meLISTEN",
    accent: "quest",
    isPartnerConfirmed: false,
  },
];

export function getRadioStation(id: string): RadioStation | undefined {
  return RADIO_STATIONS.find((station) => station.id === id);
}

/** The station shown on Home. Fixed so the demo never shuffles mid-presentation. */
export const FEATURED_STATION_ID = "radio-987";
