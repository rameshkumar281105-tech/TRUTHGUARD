import("./src/lib/web-search-provider.server.ts").then(async (m) => {
  const results = await m.webSearch("Tamil Nadu government news", 3);
  console.log(JSON.stringify(results, null, 2));
});
