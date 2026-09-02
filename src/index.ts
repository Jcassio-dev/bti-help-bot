import { connectToWhatsApp } from "./core/bot";
import { agendarDiario } from "./core/agenda";
import { aquecerCardapioHoje } from "./commands/ru";

async function startBot() {
  await connectToWhatsApp();
  agendarDiario("ru", 6, aquecerCardapioHoje);
}

startBot().catch((err) => console.error("Failed to start bot:", err));
