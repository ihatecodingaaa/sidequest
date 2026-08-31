"use client";

import { useState } from "react";
import { ArrowLeft, Check, PenLine, Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";
import { sanitiseText } from "@/lib/format";
import { ChoiceCards } from "@/components/interaction";
import { PROTECTIVE_FACTORS } from "@/data/protective-factors";
import {
  CUSTOM_DETAIL_MAX,
  QUEST_DECISIONS,
  QUEST_PRIMARY_FACTORS,
  QUEST_SECONDARY_FACTORS,
  QUEST_SETTINGS,
  QUEST_TRIGGERS,
  generateQuestDraft,
} from "@/data/quest-builder";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import type { ChoiceOption } from "@/types/interaction";
import type { ProtectiveFactorId } from "@/types/protective";

/**
 * Build a quest, in four taps.
 *
 * ---
 *
 * ## What changed and why
 *
 * This screen used to be four `<textarea>` fields. Testers named it: "there is
 * too much typing". It is now four choice screens and a preview, and a young
 * person can produce a complete, structured, reviewable scenario draft without
 * the keyboard appearing once.
 *
 * The thing that had to survive the change is the Youth-Led criterion. Removing
 * typing must not remove authorship, so what the builder asks for is the same
 * four things the form asked for, in the same order, and the young person's
 * answers are still the whole content of the draft. What they no longer have
 * to do is write the connective prose, which is the part that was friction
 * rather than expression.
 *
 * ## Typing is still here for anybody who wants it
 *
 * "Add my own detail" is a secondary control on the preview. Tapping it reveals
 * two short single-line fields. Neither is required, a draft saved without them
 * is complete, and nothing about the flow suggests that the person who typed
 * made a better quest than the person who did not. That is the shape the
 * feedback actually asked for: not "no typing", but "no typing I did not
 * choose".
 *
 * ## Something else
 *
 * Every step's last option opens a second page of options rather than a text
 * box. An "Other" that drops the player into free text is the old form wearing
 * a different label, and it would arrive at exactly the moment somebody has
 * already told us none of the offered answers fit, which is the worst possible
 * moment to hand them a keyboard.
 *
 * ## Moderation is unchanged
 *
 * A draft is a draft. It stays on the device, it is labelled on screen, and
 * nothing here publishes anything. Fewer keystrokes does not mean fewer
 * safeguards.
 */

type Step = "setting" | "trigger" | "decision" | "factor" | "preview";

const STEP_ORDER: Step[] = ["setting", "trigger", "decision", "factor"];

const STEP_TITLE: Record<Step, string> = {
  setting: "Where does it happen?",
  trigger: "What starts the moment?",
  decision: "What decision matters?",
  factor: "What could change the outcome?",
  preview: "Your quest",
};

const ELSEWHERE = "__more__";

export function QuestBuilder() {
  const { profile } = useProfile();
  const addQuestDraft = useAppStore((state) => state.addQuestDraft);

  const [step, setStep] = useState<Step>("setting");
  /** Whether this step is showing its second page of options. */
  const [more, setMore] = useState(false);

  const [settingId, setSettingId] = useState<string | null>(null);
  const [triggerId, setTriggerId] = useState<string | null>(null);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<ProtectiveFactorId | null>(null);

  const [customOpen, setCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [savedTitle, setSavedTitle] = useState<string | null>(null);

  const drafts = profile.questDrafts ?? [];

  const go = (next: Step) => {
    setStep(next);
    setMore(false);
  };

  const back = () => {
    if (more) {
      setMore(false);
      return;
    }
    const index = STEP_ORDER.indexOf(step);
    if (step === "preview") go("factor");
    else if (index > 0) go(STEP_ORDER[index - 1]);
  };

  const reset = () => {
    setSettingId(null);
    setTriggerId(null);
    setDecisionId(null);
    setFactorId(null);
    setCustomOpen(false);
    setCustomTitle("");
    setCustomDetail("");
    go("setting");
  };

  /* --------------------------------------------------------- Saved state */

  if (savedTitle) {
    return (
      <div className="mt-4">
        <div className="rounded-2xl border border-volt-500/30 bg-volt-500/8 p-4">
          <p
            role="status"
            className="flex items-center gap-2 text-sm font-bold text-volt-300"
          >
            <Check aria-hidden className="size-4" strokeWidth={3} />
            Saved as a draft
          </p>
          <p className="mt-1.5 font-display text-lg font-extrabold tracking-tight text-chalk">
            {savedTitle}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-mist">
            It stays on this device and goes to a facilitator or a teacher before anything is ever
            published. Nothing here becomes live content in the app.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSavedTitle(null);
            reset();
          }}
          className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
        >
          Build another
        </button>

        <DraftList drafts={drafts} />
      </div>
    );
  }

  /* ------------------------------------------------------------- Preview */

  if (step === "preview" && settingId && triggerId && decisionId && factorId) {
    const generated = generateQuestDraft({ settingId, triggerId, decisionId, factorId });
    const title = sanitiseText(customTitle, 60) || generated.title;
    const detail = sanitiseText(customDetail, CUSTOM_DETAIL_MAX);

    const save = () => {
      addQuestDraft({
        title,
        hook: generated.hook,
        moment: generated.moment,
        response: generated.response,
        settingId,
        triggerId,
        decisionId,
        factorId,
        ...(detail ? { customDetail: detail } : {}),
        source: "builder",
      });
      setSavedTitle(title);
    };

    return (
      <div className="mt-4">
        <StepHeader step="preview" onBack={back} />

        <div className="mt-3 rounded-2xl border border-white/12 bg-white/4 p-4">
          <h3 className="font-display text-xl leading-tight font-extrabold tracking-tight text-chalk">
            {title}
          </h3>

          <Field label="Hook" value={generated.hook} />
          <Field label="The moment" value={generated.moment} />
          <Field label="What could work" value={generated.response} />
          {detail ? <Field label="Your note" value={detail} /> : null}
        </div>

        {/*
          Honesty about what just happened.

          A template is not a writer, and a screen that lets somebody believe
          four taps were turned into prose by something clever is lying about
          the one part of the product a young person might repeat to a friend.
        */}
        <p className="mt-2.5 flex items-start gap-2 text-xs leading-relaxed text-faint">
          <Sparkles aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          Assembled from your four choices using a fixed template. No AI wrote this, and the same
          four taps always produce the same draft.
        </p>

        <button
          type="button"
          onClick={save}
          className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
        >
          Save draft
        </button>

        {/*
          The keyboard, offered rather than imposed.

          Everything above this line is complete without it. This is the door
          for somebody who has an idea the four steps could not hold, which is
          a real person worth building for and a minority of players.
        */}
        {!customOpen ? (
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="sq-pressable mt-2.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 text-sm font-semibold text-mist hover:text-chalk"
          >
            <PenLine aria-hidden className="size-4" />
            Add my own detail
          </button>
        ) : (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/12 bg-white/3 p-3.5">
            <p className="text-xs leading-relaxed text-muted">
              Both optional. The draft above is already complete.
            </p>
            <ShortField
              label="Call it something else"
              value={customTitle}
              placeholder={generated.title}
              max={60}
              onChange={setCustomTitle}
            />
            <ShortField
              label="Add a line of your own"
              value={customDetail}
              placeholder="One thing that would make this real"
              max={CUSTOM_DETAIL_MAX}
              onChange={setCustomDetail}
            />
          </div>
        )}

        <DraftList drafts={drafts} />
      </div>
    );
  }

  /* --------------------------------------------------------- Four steps */

  const options = stepOptions(step, { triggerId, more });

  const choose = (id: string) => {
    if (id === ELSEWHERE) {
      setMore(true);
      return;
    }
    if (step === "setting") {
      setSettingId(id);
      go("trigger");
    } else if (step === "trigger") {
      setTriggerId(id);
      /* A new trigger can invalidate the decision chosen under the old one. */
      setDecisionId(null);
      go("decision");
    } else if (step === "decision") {
      setDecisionId(id);
      go("factor");
    } else if (step === "factor") {
      setFactorId(id as ProtectiveFactorId);
      go("preview");
    }
  };

  return (
    <div className="mt-4">
      <StepHeader step={step} onBack={step === "setting" && !more ? undefined : back} />
      <ChoiceCards
        className="mt-3"
        options={options}
        onChoose={choose}
        legend={STEP_TITLE[step]}
      />
      <DraftList drafts={drafts} />
    </div>
  );
}

/* ------------------------------------------------------------- Internals */

function stepOptions(
  step: Step,
  { triggerId, more }: { triggerId: string | null; more: boolean },
): ChoiceOption[] {
  const elsewhere: ChoiceOption = {
    id: ELSEWHERE,
    label: step === "setting" ? "Somewhere else" : "Something else",
    hint: "Other options",
  };

  if (step === "setting") {
    const list = QUEST_SETTINGS.filter((entry) => Boolean(entry.secondary) === more);
    const options = list.map((entry) => ({
      id: entry.id,
      label: entry.label,
      icon: entry.icon,
    }));
    return more ? options : [...options, elsewhere];
  }

  if (step === "trigger") {
    const list = QUEST_TRIGGERS.filter((entry) => Boolean(entry.secondary) === more);
    const options = list.map((entry) => ({
      id: entry.id,
      label: entry.label,
      icon: entry.icon,
    }));
    return more ? options : [...options, elsewhere];
  }

  if (step === "decision") {
    /*
     * Situation-sensitive, which is the whole reason the trigger declares its
     * own decision list. Offering "change the situation" after "someone is
     * being pressured" would be a mechanic looking for somewhere to be used.
     */
    const trigger = QUEST_TRIGGERS.find((entry) => entry.id === triggerId);
    const ids = trigger?.decisionIds ?? Object.keys(QUEST_DECISIONS);
    const shown = more
      ? Object.keys(QUEST_DECISIONS).filter((id) => !ids.includes(id))
      : ids;
    const options = shown
      .map((id) => QUEST_DECISIONS[id])
      .filter(Boolean)
      .map((entry) => ({ id: entry.id, label: entry.label, icon: entry.icon }));
    return more || options.length === 0 ? options : [...options, elsewhere];
  }

  const factorIds = more ? QUEST_SECONDARY_FACTORS : QUEST_PRIMARY_FACTORS;
  const options = factorIds.map((id) => ({
    id,
    label: PROTECTIVE_FACTORS[id].label,
  }));
  return more ? options : [...options, elsewhere];
}

function StepHeader({ step, onBack }: { step: Step; onBack?: () => void }) {
  const index = STEP_ORDER.indexOf(step);

  return (
    <div>
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back a step"
            className="sq-pressable -ml-2 grid size-11 shrink-0 place-items-center rounded-full text-faint hover:text-chalk"
          >
            <ArrowLeft aria-hidden className="size-4" />
          </button>
        ) : null}
        <p className="text-xs font-bold tracking-[0.12em] text-faint uppercase">
          {step === "preview" ? "Preview" : `Step ${index + 1} of 4`}
        </p>
      </div>

      <h3 className="mt-1 font-display text-xl leading-tight font-extrabold tracking-tight text-chalk">
        {STEP_TITLE[step]}
      </h3>

      {/*
        Progress by shape and position, not by colour alone. Four segments,
        filled left to right, with the count stated in text above.
      */}
      <div aria-hidden className="mt-2.5 flex gap-1.5">
        {STEP_ORDER.map((entry, position) => (
          <span
            key={entry}
            className={cn(
              "h-1 flex-1 rounded-full",
              step === "preview" || position <= index ? "bg-volt-500" : "bg-white/10",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <p className="text-[0.6rem] font-bold tracking-[0.12em] text-faint uppercase">{label}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-mist">{value}</p>
    </div>
  );
}

/**
 * One short line, never a paragraph.
 *
 * `<input>` rather than `<textarea>` on purpose: the height of a control is a
 * promise about how much is expected, and a six-row box asks for an essay
 * whether or not the label does. `data-input-role` is what
 * `tests/unit/integrity.test.ts` reads to prove this field is optional creator
 * expression rather than a gameplay requirement that crept back in.
 */
function ShortField({
  label,
  value,
  placeholder,
  max,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  max: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold tracking-[0.08em] text-faint uppercase">{label}</span>
      <input
        data-input-role="optional-creator"
        value={value}
        placeholder={placeholder}
        maxLength={max}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-12 w-full rounded-xl border border-white/12 bg-white/4 px-3.5 text-base text-chalk placeholder:text-faint focus:border-volt-500/60 focus:outline-none"
      />
    </label>
  );
}

function DraftList({ drafts }: { drafts: { id: string; title: string; moment: string }[] }) {
  if (drafts.length === 0) return null;

  return (
    <ul className="mt-5 space-y-2">
      {drafts.map((draft) => (
        <li key={draft.id} className="rounded-xl border border-white/8 bg-white/2 px-3.5 py-2.5">
          <p className="flex items-center gap-2 text-sm font-bold text-chalk">
            {draft.title}
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.08em] text-faint uppercase">
              Draft
            </span>
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{draft.moment}</p>
        </li>
      ))}
    </ul>
  );
}
