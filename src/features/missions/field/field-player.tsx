"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, CameraOff, Check, KeyRound, MapPin, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { MissionComplete } from "@/features/missions/engine/mission-complete";
import { useAppStore } from "@/store/app-store";
import { sanitiseText } from "@/lib/format";
import type { AwardResult } from "@/lib/xp";
import type { Mission } from "@/types/mission";

type Step = "brief" | "checkin" | "tasks" | "complete";

const TASKS = [
  {
    id: "task-1",
    label: "Find a place where the safe action is slower than the unsafe one",
    hint: "A gate, a queue, a counter, a machine.",
  },
  {
    id: "task-2",
    label: "Find a place where you cannot tell what the system thinks you did",
    hint: "No confirmation, no receipt, no visible state.",
  },
  {
    id: "task-3",
    label: "Find a place where asking for help would be embarrassing",
    hint: "If it needs an audience, it has a social cost.",
  },
];

/**
 * Field Quest check-in.
 *
 * Two paths, and the manual one is never hidden behind a failure. Camera
 * scanning is a convenience: if the browser has no BarcodeDetector, or the
 * user declines the permission, or the hardware simply is not there, the code
 * entry is already on screen. A demo must never hinge on a camera prompt.
 */
export function FieldPlayer({ mission }: { mission: Mission }) {
  const completeMission = useAppStore((state) => state.completeMission);

  const [step, setStep] = useState<Step>("brief");
  const [done, setDone] = useState<string[]>([]);
  const [result, setResult] = useState<AwardResult | null>(null);

  const exitHref = `/missions/${mission.id}`;

  const finish = () => {
    setResult(completeMission(mission.id));
    setStep("complete");
  };

  if (step === "brief") {
    return (
      <MissionShell
        title={mission.title}
        accent="volt"
        progress={0.15}
        exitHref={exitHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("checkin")}>
            Check in
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip accent="volt">Field Quest</Chip>
            <ProvenanceTag provenance={mission.provenance} compact />
          </div>

          <h1 className="mt-4 text-balance-tight font-display text-[2rem] leading-[1.1] font-extrabold tracking-tight text-chalk">
            {mission.title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-mist">{mission.description}</p>

          {mission.location ? (
            <div className="sq-card mt-6 flex gap-3 p-4">
              <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-300" />
              <div>
                <p className="font-display text-base font-bold text-chalk">
                  {mission.location.area}
                </p>
                <p className="mt-0.5 text-sm text-mist">{mission.location.venue}</p>
                {mission.location.note ? (
                  <p className="mt-2 text-xs text-faint">{mission.location.note}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">
              What you will do
            </h2>
            <ol className="mt-3 space-y-2.5">
              {TASKS.map((task, index) => (
                <li key={task.id} className="sq-card-flat flex gap-3 p-3.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-volt-500/15 text-xs font-bold text-volt-300">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-chalk">{task.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{task.hint}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/4 p-4">
            <ShieldCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-400" />
            <p className="text-sm leading-relaxed text-mist">
              You are looking at systems, not at people. Do not photograph anybody, do not follow
              anybody, and do not record staff. If a place feels wrong to be in, leave.
            </p>
          </div>
        </div>
      </MissionShell>
    );
  }

  if (step === "checkin") {
    return (
      <MissionShell
        title={mission.title}
        accent="volt"
        progress={0.45}
        exitHref={exitHref}
      >
        <CheckIn
          expectedCode={mission.checkInCode ?? "SQ-DEMO"}
          onSuccess={() => setStep("tasks")}
        />
      </MissionShell>
    );
  }

  if (step === "tasks") {
    const allDone = done.length === TASKS.length;

    return (
      <MissionShell
        title={mission.title}
        accent="volt"
        progress={0.8}
        exitHref={exitHref}
        footer={
          <Button
            variant={allDone ? "volt" : "secondary"}
            size="lg"
            full
            disabled={!allDone}
            onClick={finish}
          >
            {allDone ? "Submit findings" : `${TASKS.length - done.length} to go`}
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-volt-500/30 bg-volt-500/10 px-3 py-1 text-xs font-semibold text-volt-300">
            <Check aria-hidden className="size-3.5" />
            Checked in
          </p>

          <h1 className="mt-4 font-display text-2xl leading-tight font-extrabold text-chalk">
            Three things to find
          </h1>
          <p className="mt-2 text-sm text-muted">
            Tick each one when you have found it. Nothing you record leaves your device.
          </p>

          <ul className="mt-5 space-y-2.5">
            {TASKS.map((task) => {
              const checked = done.includes(task.id);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() =>
                      setDone((current) =>
                        current.includes(task.id)
                          ? current.filter((id) => id !== task.id)
                          : [...current, task.id],
                      )
                    }
                    className={cn(
                      "sq-pressable flex w-full items-start gap-3 rounded-2xl border p-4 text-left",
                      checked
                        ? "border-volt-500/40 bg-volt-500/8"
                        : "border-white/10 bg-white/4 hover:bg-white/7",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border",
                        checked ? "border-volt-400 bg-volt-500 text-ink-900" : "border-white/20",
                      )}
                    >
                      {checked ? <Check aria-hidden className="size-4" strokeWidth={3} /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-chalk">{task.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">{task.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </MissionShell>
    );
  }

  if (step === "complete" && result) {
    return (
      <MissionShell title={mission.title} accent="volt" progress={1} exitHref={exitHref}>
        <MissionComplete
          mission={mission}
          result={result}
          summary="You checked in on site and logged three design problems in a real space."
        />
      </MissionShell>
    );
  }

  return null;
}

/* ------------------------------------------------------------- Check-in */

type ScanState = "idle" | "starting" | "scanning" | "unsupported" | "denied";

function CheckIn({
  expectedCode,
  onSuccess,
}: {
  expectedCode: string;
  onSuccess: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const submitCode = (value: string) => {
    if (value.trim().toUpperCase() === expectedCode.toUpperCase()) {
      stop();
      onSuccess();
      return true;
    }
    setError("That code does not match this Field Quest.");
    return false;
  };

  const startCamera = async () => {
    setError(null);

    // Feature detection first: Safari has no BarcodeDetector, and there is no
    // point asking for a camera we cannot read.
    const Detector = (
      window as unknown as {
        BarcodeDetector?: new (options?: { formats?: string[] }) => {
          detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
        };
      }
    ).BarcodeDetector;

    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setScanState("unsupported");
      return;
    }

    setScanState("starting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        stop();
        setScanState("unsupported");
        return;
      }

      video.srcObject = stream;
      await video.play();
      setScanState("scanning");

      const detector = new Detector({ formats: ["qr_code"] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          const match = results.find((entry) =>
            entry.rawValue.trim().toUpperCase().includes(expectedCode.toUpperCase()),
          );
          if (match) {
            stop();
            onSuccess();
            return;
          }
        } catch {
          // A single failed frame is normal. Keep going.
        }
        rafRef.current = requestAnimationFrame(() => {
          void tick();
        });
      };

      rafRef.current = requestAnimationFrame(() => {
        void tick();
      });
    } catch {
      stop();
      setScanState("denied");
    }
  };

  return (
    <div className="animate-rise py-2">
      <h1 className="font-display text-2xl leading-tight font-extrabold text-chalk">Check in</h1>
      <p className="mt-2 text-sm text-muted">
        Scan the code at the location, or type it in. Either works.
      </p>

      {/* Camera. The video element stays mounted so the ref is always valid. */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-ink-850">
        <div className={cn("relative aspect-square w-full", scanState !== "scanning" && "hidden")}>
          <video
            ref={videoRef}
            playsInline
            muted
            className="size-full object-cover"
            aria-label="Camera viewfinder"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-volt-400/70"
          />
        </div>

        {scanState !== "scanning" ? (
          <div className="flex flex-col items-center gap-3 px-6 py-9 text-center">
            {scanState === "unsupported" || scanState === "denied" ? (
              <CameraOff aria-hidden className="size-7 text-faint" />
            ) : (
              <Camera aria-hidden className="size-7 text-faint" />
            )}
            <p className="text-sm text-mist">
              {scanState === "unsupported"
                ? "This browser cannot scan QR codes. Use the code below instead."
                : scanState === "denied"
                  ? "No camera access. Use the code below instead."
                  : "Scan the QR code at the location."}
            </p>
            {scanState === "idle" || scanState === "starting" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  void startCamera();
                }}
                disabled={scanState === "starting"}
              >
                {scanState === "starting" ? "Starting camera" : "Open camera"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Manual code, always visible */}
      <div className="sq-card mt-4 p-4">
        <label className="block">
          <span className="flex items-center gap-2 text-sm font-semibold text-chalk">
            <KeyRound aria-hidden className="size-4 text-faint" />
            Or enter the mission code
          </span>
          <input
            value={code}
            onChange={(event) => {
              setCode(sanitiseText(event.target.value, 20));
              setError(null);
            }}
            placeholder={expectedCode}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 font-mono text-base tracking-wider text-chalk uppercase placeholder:text-faint placeholder:normal-case focus:border-volt-400 focus:outline-none"
          />
        </label>

        {error ? (
          <p role="alert" className="mt-2 text-sm text-coral-300">
            {error}
          </p>
        ) : null}

        <Button
          variant="volt"
          size="lg"
          full
          className="mt-3"
          disabled={code.trim().length === 0}
          onClick={() => submitCode(code)}
        >
          Check in
        </Button>

        <p className="mt-3 text-xs leading-relaxed text-faint">
          Prototype code for this demo:{" "}
          <span className="font-mono font-semibold text-mist">{expectedCode}</span>
        </p>
      </div>
    </div>
  );
}
