const autocannon = require("autocannon");

const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/api/health`;

console.log(`Running performance test on ${url}`);

autocannon(
  {
    url,
    connections: 50,
    pipelining: 1,
    duration: 10,
  },
  (err, result) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(autocannon.printResult(result));
  }
);
