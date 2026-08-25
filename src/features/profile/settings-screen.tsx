"use client";

import { useState } from "react";
import { Check, Loader, MapPin, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";
import { AGE_BANDS, type AgeBand, type Interest } from "@/types/core";
import { INTEREST_OPTIONS, NEIGHBOURHOOD_NAMES, nearestNeighbourhood } from "@/data/neighbourhoods";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";

type LocationState = "idle" | "asking" | "denied" | "unavailable" | "done";

export function SettingsScreen() {
  const { profile, ready } = useProfile();
  const setInterests = useAppStore((state) => state.setInterests);
  const setAgeBand = useAppStore((state) => state.setAgeBand);
  const setNeighbourhood = useAppStore((state) => state.setNeighbourhood);
  const setDisplayName = useAppStore((state) => state.setDisplayName);
  const loadDemoProgress = useAppStore((state) => state.loadDemoProgress);
  const resetDemo = useAppStore((state) => state.resetDemo);

  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleInterest = (id: Interest) => {
    const next = profile.interests.includes(id)
      ? profile.interests.filter((value) => value !== id)
      : [...profile.interests, id];
    setInterests(next);
  };

  /**
   * The only place SIDEQUEST touches the geolocation API.
   * The reading is used once, in memory, to pick the nearest town name.
   * The coordinates are never stored, never sent anywhere, and go out of scope
   * as soon as this callback returns.
   */
  const useMyArea = () => {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("asking");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNeighbourhood(nearestNeighbourhood(position.coords.latitude, position.coords.longitude));
        setLocationState("done");
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="You"
        title="Settings"
        lede="Everything here lives on this device. There is no account and no server."
      />

      {/* Name */}
      <section>
        <label className="block">
          <span className="text-lg font-bold tracking-tight text-chalk">Name</span>
          <span className="mt-0.5 block text-sm text-muted">
            Used only for the greeting on Home.
          </span>
          <input
            value={ready ? profile.displayName : ""}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Optional"
            maxLength={24}
            className="mt-3 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-chalk placeholder:text-faint focus:border-quest-400 focus:outline-none"
          />
        </label>
      </section>

      {/* Age band */}
      <section>
        <SectionHeader title="Age band" subtitle="Changes which missions surface first." />
        <div className="grid grid-cols-2 gap-2">
          {AGE_BANDS.map((band: AgeBand) => (
            <button
              key={band}
              type="button"
              onClick={() => setAgeBand(band)}
              aria-pressed={ready && profile.ageBand === band}
              className={cn(
                "sq-pressable min-h-12 rounded-2xl border text-sm font-semibold",
                ready && profile.ageBand === band
                  ? "border-quest-400 bg-quest-500/15 text-quest-300"
                  : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
              )}
            >
              {band}
            </button>
          ))}
        </div>
      </section>

      {/* Interests */}
      <section>
        <SectionHeader title="Interests" subtitle="Reorders Pulse and Missions. Nothing is hidden." />
        <div className="grid grid-cols-2 gap-2">
          {INTEREST_OPTIONS.map((option) => {
            const selected = ready && profile.interests.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleInterest(option.id)}
                aria-pressed={selected}
                className={cn(
                  "sq-pressable min-h-12 rounded-2xl border px-3 text-left text-sm font-semibold",
                  selected
                    ? "border-volt-500/50 bg-volt-500/12 text-volt-300"
                    : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Area */}
      <section>
        <SectionHeader title="Your area" subtitle="Optional. Used to surface nearby activity." />

        <div className="sq-card mb-3 flex gap-3 p-4">
          <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-400" />
          <p className="text-xs leading-relaxed text-mist">
            If you use the button below, your location is read once to work out the nearest town
            name. The coordinates are never stored and never leave your device. You can always pick
            an area by hand instead, or none at all.
          </p>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={useMyArea} disabled={locationState === "asking"}>
            {locationState === "asking" ? (
              <Loader aria-hidden className="size-4 animate-spin" />
            ) : (
              <MapPin aria-hidden className="size-4" />
            )}
            {locationState === "asking" ? "Asking" : "Use my area"}
          </Button>
          {ready && profile.neighbourhood ? (
            <Button variant="ghost" onClick={() => setNeighbourhood(null)}>
              Clear
            </Button>
          ) : null}
        </div>

        {locationState === "denied" || locationState === "unavailable" ? (
          <p className="mb-3 text-sm text-muted">
            No problem. Pick an area below instead. Everything in SIDEQUEST works without location.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {NEIGHBOURHOOD_NAMES.map((area) => {
            const selected = ready && profile.neighbourhood === area;
            return (
              <button
                key={area}
                type="button"
                onClick={() => setNeighbourhood(selected ? null : area)}
                aria-pressed={selected}
                className={cn(
                  "sq-pressable min-h-11 rounded-xl border px-3 text-sm font-medium",
                  selected
                    ? "border-pulse-500/50 bg-pulse-500/12 text-pulse-300"
                    : "border-white/10 bg-white/4 text-mist hover:bg-white/7",
                )}
              >
                {area}
              </button>
            );
          })}
        </div>
      </section>

      {/* Demo controls */}
      <section>
        <SectionHeader
          title="Demo controls"
          subtitle="For running the app in front of someone, twice in a row."
        />

        <div className="space-y-2.5">
          <div className="sq-card p-4">
            <div className="flex items-start gap-3">
              <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0 text-quest-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-chalk">Load demo progress</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  Fills in a deterministic set of XP, completed missions and skill points so the
                  Safety Passport and rewards have something in them. Always produces the same state.
                </p>
              </div>
            </div>
            <Button variant="secondary" full className="mt-3" onClick={loadDemoProgress}>
              Load demo progress
            </Button>
          </div>

          <div className="rounded-3xl border border-coral-500/25 bg-coral-500/8 p-4">
            <div className="flex items-start gap-3">
              <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-coral-300" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-coral-300">Reset demo</p>
                <p className="mt-0.5 text-xs leading-relaxed text-mist">
                  Clears everything on this device and returns to onboarding. Use this between
                  judges.
                </p>
              </div>
            </div>

            {confirmReset ? (
              <div className="mt-3 flex gap-2.5">
                <Button variant="ghost" full onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
                <Button variant="danger" full onClick={resetDemo}>
                  <Check aria-hidden className="size-4" />
                  Yes, reset
                </Button>
              </div>
            ) : (
              <Button variant="secondary" full className="mt-3" onClick={() => setConfirmReset(true)}>
                <RefreshCw aria-hidden className="size-4" />
                Reset demo
              </Button>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-faint">
          Shortcuts: add <span className="font-mono text-mist">?demo=1</span> to the home URL to load
          demo progress, or <span className="font-mono text-mist">?demo=reset</span> to clear
          everything.
        </p>
      </section>

      {/* Data */}
      <section>
        <SectionHeader title="What SIDEQUEST stores" />
        <ul className="space-y-2">
          {[
            "Your name, age band, interests and area, if you gave them.",
            "XP, completed mission ids, saved stories and reward claims.",
            "Build Quest submissions you wrote.",
            "Nothing else. No coordinates, no location history, no analytics, no account.",
          ].map((line) => (
            <li key={line} className="sq-card-flat flex gap-2.5 p-3.5 text-sm leading-relaxed text-mist">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-volt-400" />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
