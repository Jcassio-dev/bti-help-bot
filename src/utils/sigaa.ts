import axios from "axios";

const API = process.env.API_BASE_URL || "http://localhost:8080";
const KEY = process.env.API_SECRET_KEY;

const cli = axios.create({
  baseURL: `${API}/api/sigaa`,
  headers: KEY ? { "X-API-Key": KEY } : {},
  timeout: 35000,
});

export interface Turma {
  codigo: string;
  nome: string;
  local: string;
  horario: string;
}

export async function gerarLink(jid: string): Promise<string> {
  const { data } = await cli.post("/conectar", { jid });
  return data.link as string;
}

export async function temSessao(jid: string): Promise<boolean> {
  const { data } = await cli.get("/status", { params: { jid } });
  return Boolean(data.conectado);
}

export async function desconectar(jid: string): Promise<void> {
  await cli.delete("/sessao", { params: { jid } });
}

export async function buscarTurmas(jid: string): Promise<Turma[]> {
  const { data } = await cli.get("/turmas", { params: { jid } });
  return data as Turma[];
}

export async function atualizar(jid: string): Promise<void> {
  await cli.post("/atualizar", null, { params: { jid } });
}

export function precisaConectar(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 401;
}

/** Horario tipo 24M34 -> "Seg e Qua, manha (3-4)". Volta como veio se nao casar. */
export function horarioLegivel(codigo: string): string {
  const m = /^(\d+)([MTN])(\d+)$/.exec(codigo);
  if (!m) return codigo;
  const dias: Record<string, string> = {
    "1": "Dom", "2": "Seg", "3": "Ter", "4": "Qua", "5": "Qui", "6": "Sex", "7": "Sáb",
  };
  const turno: Record<string, string> = { M: "manhã", T: "tarde", N: "noite" };
  const d = m[1].split("").map((x) => dias[x] ?? x).join(" e ");
  const h = m[3];
  return `${d}, ${turno[m[2]]} (${h[0]}º-${h[h.length - 1]}º)`;
}
