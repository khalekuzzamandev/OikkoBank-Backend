import "dotenv/config";

import app from "./app.js";
import { connectToDatabase } from "./config/index.js";

const port = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  await connectToDatabase();

  app.listen(port, () => {
    console.log(`Oikko Bank API running on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
