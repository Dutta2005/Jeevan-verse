import { describe, expect, it } from "vitest";
import { State, City } from "country-state-city";
import { indianStates, getIndianCities } from "../india-locations";

describe("India-only location data", () => {
  it("preserves every Indian state and its ordered city choices from the installed source", async () => {
    expect(indianStates).toEqual(
      State.getStatesOfCountry("IN").map(({ name, isoCode }) => ({ name, isoCode })),
    );
    for (const state of indianStates) {
      expect(await getIndianCities(state.isoCode)).toEqual(
        City.getCitiesOfState("IN", state.isoCode).map(({ name }) => name),
      );
    }
  });

  it("returns no suggestions when a state is unselected or unknown", async () => {
    expect(await getIndianCities("")).toEqual([]);
    expect(await getIndianCities("unknown")).toEqual([]);
    expect(await getIndianCities("constructor")).toEqual([]);
  });
});
