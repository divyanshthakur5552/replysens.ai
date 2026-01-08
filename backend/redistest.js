const { createClient } = require("redis");

const client = createClient();

async function test() {
  await client.connect();
  await client.set("test", "Redis is working");
  const val = await client.get("test");
  console.log("Redis says:", val);
}

test();
