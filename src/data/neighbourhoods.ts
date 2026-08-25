import type { Interest } from "@/types/core";

/**
 * Area selection.
 *
 * SIDEQUEST never stores coordinates and never builds a location history. If a
 * user opts into the browser location prompt, the reading is used once, in
 * memory, to pick the nearest name from this table, and then discarded. The
 * neighbourhood name is the finest granularity the product ever keeps, and even
 * that is optional: manual selection is the primary path.
 *
 * Centroids are approximate town centres, accurate enough for nearest-match and
 * useless for anything more precise.
 */

export interface Neighbourhood {
  name: string;
  lat: number;
  lng: number;
}

export const NEIGHBOURHOODS: readonly Neighbourhood[] = [
  { name: "Ang Mo Kio", lat: 1.3691, lng: 103.8454 },
  { name: "Bedok", lat: 1.3236, lng: 103.9273 },
  { name: "Bishan", lat: 1.3526, lng: 103.8352 },
  { name: "Bukit Batok", lat: 1.359, lng: 103.7637 },
  { name: "Bukit Merah", lat: 1.2819, lng: 103.8239 },
  { name: "Bukit Panjang", lat: 1.3774, lng: 103.7719 },
  { name: "Choa Chu Kang", lat: 1.384, lng: 103.747 },
  { name: "Clementi", lat: 1.3162, lng: 103.7649 },
  { name: "Geylang", lat: 1.3201, lng: 103.8918 },
  { name: "Hougang", lat: 1.3612, lng: 103.8863 },
  { name: "Jurong East", lat: 1.3329, lng: 103.7436 },
  { name: "Jurong West", lat: 1.3404, lng: 103.709 },
  { name: "Kallang", lat: 1.31, lng: 103.8714 },
  { name: "Marine Parade", lat: 1.302, lng: 103.8971 },
  { name: "Pasir Ris", lat: 1.3721, lng: 103.9474 },
  { name: "Punggol", lat: 1.3984, lng: 103.9072 },
  { name: "Queenstown", lat: 1.2942, lng: 103.8059 },
  { name: "Sembawang", lat: 1.4491, lng: 103.8185 },
  { name: "Sengkang", lat: 1.3868, lng: 103.8914 },
  { name: "Serangoon", lat: 1.3554, lng: 103.8679 },
  { name: "Tampines", lat: 1.3496, lng: 103.9568 },
  { name: "Toa Payoh", lat: 1.3343, lng: 103.8563 },
  { name: "Woodlands", lat: 1.4382, lng: 103.789 },
  { name: "Yishun", lat: 1.4304, lng: 103.8354 },
] as const;

export const NEIGHBOURHOOD_NAMES: readonly string[] = NEIGHBOURHOODS.map((area) => area.name);

/**
 * Nearest town centre by plain squared distance. Singapore spans well under one
 * degree, so there is no reason to reach for a great-circle formula here.
 */
export function nearestNeighbourhood(lat: number, lng: number): string {
  let best = NEIGHBOURHOODS[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const area of NEIGHBOURHOODS) {
    const dLat = area.lat - lat;
    const dLng = area.lng - lng;
    const distance = dLat * dLat + dLng * dLng;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = area;
    }
  }

  return best.name;
}

export interface InterestOption {
  id: Interest;
  label: string;
  blurb: string;
}

export const INTEREST_OPTIONS: readonly InterestOption[] = [
  { id: "scams", label: "Scams", blurb: "Spotting them before they land" },
  { id: "cyber", label: "Online safety", blurb: "Accounts, privacy, deepfakes" },
  { id: "peer-pressure", label: "Friends and pressure", blurb: "Group situations" },
  { id: "design", label: "Safety design", blurb: "Fixing the environment" },
  { id: "volunteering", label: "Volunteering", blurb: "Real community work" },
  { id: "events", label: "Events nearby", blurb: "Roadshows and activities" },
  { id: "news", label: "News", blurb: "What is happening in Singapore" },
  { id: "radio", label: "Radio", blurb: "Listening while you go" },
] as const;
