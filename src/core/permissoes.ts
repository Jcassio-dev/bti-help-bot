export const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const TESTER_IDS = (process.env.TESTER_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function remetente(msg: {
  key?: { participant?: string | null; remoteJid?: string | null };
}): string {
  return (msg.key?.participant || msg.key?.remoteJid || "").split("@")[0];
}

export function ehAdmin(id: string): boolean {
  return ADMIN_IDS.length > 0 && ADMIN_IDS.includes(id);
}

/** Testers incluem os admins, para admin nunca ficar de fora de comando em teste. */
export function ehTester(id: string): boolean {
  return ehAdmin(id) || (TESTER_IDS.length > 0 && TESTER_IDS.includes(id));
}

export type Nivel = "todos" | "tester" | "admin";

export function podeUsar(nivel: Nivel | undefined, id: string): boolean {
  if (!nivel || nivel === "todos") return true;
  if (nivel === "tester") return ehTester(id);
  return ehAdmin(id);
}
