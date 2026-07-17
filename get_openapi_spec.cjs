const http = require('https');

const url = "https://mlwjiiqdhnctxyvsupuo.supabase.co/rest/v1/";
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sd2ppaXFkaG5jdHh5dnN1cHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjcwODAsImV4cCI6MjA5NDM0MzA4MH0.2vYjhErK3YpF3nOz43YKPHpoN3BB3DeSahVCOIAKmD8";

const options = {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  }
};

http.get(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const spec = JSON.parse(body);
      console.log("PostgREST Tables found in OpenAPI spec:");
      console.log(Object.keys(spec.paths));
      
      console.log("\nDefinition for public.profiles:");
      const profileDef = spec.definitions.profiles;
      if (profileDef) {
        console.log(profileDef.properties);
      } else {
        console.log("profiles definition not found");
      }
    } catch (e) {
      console.error("Failed to parse OpenAPI spec:", e);
      console.log("Response body:", body);
    }
  });
}).on('error', (err) => {
  console.error("Request failed:", err);
});
