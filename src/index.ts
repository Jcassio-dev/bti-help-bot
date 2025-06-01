import { connectToWhatsApp } from "./core/bot";

async function startBot() {
  const sock = await connectToWhatsApp();
}

startBot().catch((err) => console.error("Failed to start bot:", err));
