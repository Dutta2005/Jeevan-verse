import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

// Keep country-state-city as the data source, without shipping its global dataset.
const require = createRequire(import.meta.url);
const { State, City } = require("country-state-city");
const states = State.getStatesOfCountry("IN").map(({ name, isoCode }) => ({ name, isoCode }));
const citiesByState = Object.fromEntries(
  states.map(({ isoCode }) => [
    isoCode,
    City.getCitiesOfState("IN", isoCode).map(({ name }) => name),
  ]),
);

const destination = new URL("../src/data/", import.meta.url);
await mkdir(destination, { recursive: true });
await writeFile(new URL("india-states.json", destination), `${JSON.stringify(states, null, 2)}\n`);
await writeFile(
  new URL("india-cities.json", destination),
  `${JSON.stringify(citiesByState, null, 2)}\n`,
);
