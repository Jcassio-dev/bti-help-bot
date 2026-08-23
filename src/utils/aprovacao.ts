import axios from "axios";

export interface AprovacaoItem {
  componenteId: number;
  componenteCodigo: string | null;
  componenteNome: string | null;
  docenteNome: string | null;
  docenteSlug: string | null;
  aprovados: number;
  reprovadosNota: number;
  reprovadosFalta: number;
  trancados: number;
  totalAvaliados: number;
  totalMatriculados: number;
  taxaAprovacao: number; // 0..1
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

export function linkBusca(termo: string): string {
  const q = termo ? `?q=${encodeURIComponent(termo)}` : "";
  return `${DASHBOARD}/${q}`;
}

export function linkProfessor(slug: string): string {
  return `${DASHBOARD}/professor/${slug}`;
}

export function linkTurma(codigo: string): string {
  return `${DASHBOARD}/turma/${encodeURIComponent(codigo)}`;
}

/** Coluna alinhada so existe dentro do bloco mono do WhatsApp. */
export function blocoMono(linhas: string[]): string {
  return "```\n" + linhas.join("\n") + "\n```";
}

export function tabela(
  itens: AprovacaoItem[],
  rotulo: (i: AprovacaoItem) => string,
  limite: number
): string {
  const usados = itens.slice(0, limite);
  const largura = Math.max(...usados.map((i) => String(i.totalMatriculados).length), 1);
  return blocoMono(
    usados.map((i) => {
      const taxa = `${pct(i.taxaAprovacao)}%`.padStart(4);
      const n = String(i.totalMatriculados).padStart(largura);
      return `${taxa} | ${n} | ${rotulo(i)}`;
    })
  );
}

export const LEGENDA = "_taxa = aprovados ÷ (aprovados + reprovados). n = alunos matriculados._";

export function pct(taxa: number): number {
  return Math.round(taxa * 100);
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
