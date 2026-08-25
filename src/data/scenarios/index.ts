import type { Scenario } from "@/types/scenario";
import { OTP_SCENARIO } from "./otp";
import { JOB_SCAM_SCENARIO } from "./job-scam";
import { MARKETPLACE_SCENARIO } from "./marketplace";
import { CREW_RELAY_SCENARIO } from "./crew-relay";
import { REWIND_SCENARIO } from "./rewind";

const SCENARIOS: Record<string, Scenario> = {
  [OTP_SCENARIO.id]: OTP_SCENARIO,
  [JOB_SCAM_SCENARIO.id]: JOB_SCAM_SCENARIO,
  [MARKETPLACE_SCENARIO.id]: MARKETPLACE_SCENARIO,
  [CREW_RELAY_SCENARIO.id]: CREW_RELAY_SCENARIO,
  [REWIND_SCENARIO.id]: REWIND_SCENARIO,
};

export function getScenario(missionId: string): Scenario | undefined {
  return SCENARIOS[missionId];
}

export { OTP_SCENARIO, JOB_SCAM_SCENARIO, MARKETPLACE_SCENARIO, CREW_RELAY_SCENARIO, REWIND_SCENARIO };
