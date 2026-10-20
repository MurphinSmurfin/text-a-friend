// Writes shields.io endpoint JSON for the README badges from the real build and test results.
import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";

const badge = (name, label, message, color) =>
  writeFileSync(
    `badges/${name}.json`,
    JSON.stringify({ schemaVersion: 1, label, message, color }) + "\n",
  );

mkdirSync("badges", { recursive: true });

const js = readdirSync("dist/assets")
  .filter((f) => f.endsWith(".js"))
  .reduce(
    (sum, f) => sum + gzipSync(readFileSync(`dist/assets/${f}`)).length,
    0,
  );
badge("js", "JS", `${(js / 1024).toFixed(1)} KB gzipped`, "1d4ed8");

const deps = Object.keys(
  JSON.parse(readFileSync("package.json", "utf8")).dependencies ?? {},
).length;
badge("deps", "runtime deps", String(deps), "1d4ed8");

const tests = JSON.parse(readFileSync("test-results.json", "utf8"));
const ok = tests.numFailedTests === 0;
badge(
  "tests",
  "tests",
  `${tests.numPassedTests} passing`,
  ok ? "15803d" : "b91c1c",
);
