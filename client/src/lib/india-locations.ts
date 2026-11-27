import states from "@/data/india-states.json";

export const indianStates = states;
export type IndianState = (typeof indianStates)[number];

export async function getIndianCities(stateCode: string): Promise<string[]> {
  if (!stateCode) return [];
  const { default: citiesByState }: { default: Record<string, string[]> } =
    await import("@/data/india-cities.json");
  return Object.prototype.hasOwnProperty.call(citiesByState, stateCode)
    ? citiesByState[stateCode]
    : [];
}
