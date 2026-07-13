import axios from "axios";

export interface AprovacaoItem {
  componenteId: number;
  componenteCodigo: string | null;
  componenteNome: string | null;
  docenteNome: string | null;
  aprovados: number;
  reprovados: number;
  total: number;
  taxa: number; // 0..1
}

const API = process.env.API_BASE_URL || "http://localhost:8080";
const DASHBOARD = process.env.DASHBOARD_URL || "https://bti-hp-dashboard.vercel.app";

export async function fetchAprovacao(
  kind: "disciplina" | "docente",
  q: string
): Promise<AprovacaoItem[]> {
  const { data } = await axios.get(`${API}/api/aprovacao/${kind}`, { params: { q } });
  return data as AprovacaoItem[];
}

export function link(param: "disciplina" | "professor", termo: string): string {
  const q = termo ? `?${param}=${encodeURIComponent(termo)}` : "";
  return `${DASHBOARD}/aprovacao${q}`;
}

export function pct(taxa: number): number {
  return Math.round(taxa * 100);
}

export function emoji(taxa: number): string {
  const p = taxa * 100;
  if (p >= 70) return "🟢";
  if (p >= 50) return "🟡";
  return "🔴";
}

/** Agrupa os itens por uma chave e renderiza secoes em markdown do WhatsApp. */
export function renderGrouped(
  items: AprovacaoItem[],
  keyOf: (i: AprovacaoItem) => string,
  lineOf: (i: AprovacaoItem) => string,
  maxGroups: number,
  maxPerGroup: number
): string {
  const groups = new Map<string, AprovacaoItem[]>();
  for (const it of items) {
    const k = keyOf(it) || "—";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }

  const parts: string[] = [];
  let g = 0;
  for (const [k, list] of groups) {
    if (g++ >= maxGroups) break;
    const lines = list.slice(0, maxPerGroup).map(lineOf).join("\n");
    parts.push(`*${k}*\n${lines}`);
  }
  return parts.join("\n\n");
}
