/**
 * The interaction kit.
 *
 * Five primitives, no more, and each one earns its place by being the natural
 * shape of something the narrative already wanted to do. The catalogue of ten
 * that this pass started from would have produced ten thin components and one
 * confused product; what is here is the subset that carries real variety.
 *
 *   ChoiceCards     pick what you do. Dialogue choice, path choice and quick
 *                   priority are all this component with different copy, which
 *                   is why they are not three components.
 *   Consequence     what happened, what it means, and a way out. Mandatory
 *                   after every selection, never optional.
 *   HotspotScene    tap the part of the scene that matters. Observation, and
 *                   situational prevention.
 *   OrderCards      put two to four actions in sequence. Tap to place, never
 *                   drag.
 *   PlanReveal      pick when it would really come up, and see it joined to
 *                   the response you chose. The one mechanic here with direct
 *                   evidence for carry-over outside the app.
 *
 * Prediction already exists as Norm Mirror, whose slider opens no keyboard,
 * and matching is a choice list with a different prompt. Neither needed a new
 * component, and adding one for the sake of the count would have been variety
 * for its own sake.
 */

export { ChoiceCards } from "./choice-cards";
export { Consequence } from "./consequence";
export { HotspotScene, HotspotFinding } from "./hotspot-scene";
export { OrderCards } from "./order-cards";
export { PlanReveal } from "./plan-reveal";
