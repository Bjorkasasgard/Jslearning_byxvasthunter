// Simple durability/soak test (no external tools)
// Runs repeated requests to /api/health for ~60 seconds.

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/api/health`;

const durationMs = Number(process.env.SOAK_MS || 60_000);
const concurrency = Number(process.env.SOAK_CONCURRENCY || 10);

let ok = 0;
let fail = 0;
let stop = false;

const worker = async () => {
  while (!stop) {
    try {
      const res = await fetch(url);
      if (res.ok) ok += 1;
      else fail += 1;
    } catch {
      fail += 1;
    }
  }
};

(async () => {
  console.log(`Soak test: ${url}`);
  console.log(`Duration: ${durationMs}ms, concurrency: ${concurrency}`);

  const workers = Array.from({ length: concurrency }, worker);
  setTimeout(() => {
    stop = true;
  }, durationMs);

  await Promise.all(workers);
  console.log(`Done. OK=${ok} FAIL=${fail}`);

  if (fail > 0) process.exitCode = 1;
})();
