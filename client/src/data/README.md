# Indian location choices

`india-states.json` and `india-cities.json` are generated from the installed `country-state-city`
package (GPL-3.0, https://github.com/harpreetkhalsagtbit/country-state-city).
It retains the Indian state names/codes and city names used by registration and
Blood Bridge, in the source package's ordering. It omits other countries and
unused coordinates so the browser does not download the global dataset.

Regenerate after updating the source dependency, from `client/`:

```powershell
npm.cmd run generate:locations
npm.cmd run format
```

The JSON files are committed so development and production builds use the same
data without a generation step. States load with the forms; city names load in
a separate dynamic import only after selecting a state. The browser caches the
city module for subsequent selections. Failed loads expose a retry action;
Blood Bridge also keeps manual city entry available. Location suggestions
have the same completeness and freshness limits as the source dependency.
