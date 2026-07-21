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

const MELHOR_PROFESSOR_QUE_O_IMD_TEVE = "maxwell gomes da silva";

export function ehMemorial(nome?: string | null): boolean {
  return (nome ?? "").toLowerCase().includes(MELHOR_PROFESSOR_QUE_O_IMD_TEVE);
}

export function nomeDocente(nome?: string | null): string {
  const n = nome ?? "(não informado)";
  return ehMemorial(n) ? `🕊️ ${n} (1993 - 2026)` : n;
}

export const MEMORIAL_TEXTO =
  `🕊️ *In Memoriam de Maxwell Gomes da Silva (1993 - 2026)*\n\n` +
  `Professor querido do BTI, pai e esposo dedicado, sempre lembrado pelo cuidado com cada aluno e cada turma.\n` +
  `Que estas aprovações contem um pouco do educador que ele foi.`;

export function textoHomenagemProfessor(nome?: string | null): string {
  return ehMemorial(nome)
    ? `${MEMORIAL_TEXTO}`
    : "*Aprovação entre alunos dos cursos de computação*";
}

function conta(n: number, formas: [string, string]): string {
  return `${n} ${n === 1 ? formas[0] : formas[1]}`;
}

export function renderGrouped(
  items: AprovacaoItem[],
  keyOf: (i: AprovacaoItem) => string,
  lineOf: (i: AprovacaoItem) => string,
  maxGroups: number,
  maxPerGroup: number,
  itemFormas: [string, string],
  grupoFormas: [string, string]
): string {
  const groups = new Map<string, AprovacaoItem[]>();
  for (const it of items) {
    const k = keyOf(it) || "—";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(it);
  }

  const chaves = Array.from(groups.keys());
  const parts: string[] = [];

  for (const k of chaves.slice(0, maxGroups)) {
    const list = groups.get(k)!;
    const lines = list.slice(0, maxPerGroup).map(lineOf);
    const sobra = list.length - maxPerGroup;
    if (sobra > 0) {
      lines.push(`_...e mais ${conta(sobra, itemFormas)}_`);
    }
    parts.push(`*${k}*\n${lines.join("\n")}`);
  }

  let body = parts.join("\n\n");

  const sobraGrupos = chaves.length - Math.min(chaves.length, maxGroups);
  if (sobraGrupos > 0) {
    body += `\n\n_e mais ${conta(sobraGrupos, grupoFormas)}_`;
  }
  return body;
}
