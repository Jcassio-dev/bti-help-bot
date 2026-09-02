import axios from "axios";
import { tituloCase } from "./titulo";

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

export interface Cobertura {
  ultimoSemestre: string;
  semestres: number;
}

let coberturaCache: Cobertura | null = null;

/** Ate onde os dados vao. Best-effort e cacheado; se falhar, devolve null e quem chama omite. */
export async function fetchCobertura(): Promise<Cobertura | null> {
  if (coberturaCache) return coberturaCache;
  try {
    const { data } = await axios.get(`${API}/api/aprovacao/cobertura`);
    if (data && data.ultimoSemestre) {
      coberturaCache = data as Cobertura;
      return coberturaCache;
    }
  } catch {
    // sem cobertura, o professor usa o texto generico
  }
  return null;
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

export function emoji(taxa: number): string {
  const p = taxa * 100;
  if (p >= 70) return "🟢";
  if (p >= 50) return "🟡";
  return "🔴";
}

export function listaAprovacao(
  itens: AprovacaoItem[],
  rotulo: (i: AprovacaoItem) => string,
  limite: number
): string {
  const usados = itens.slice(0, limite);
  return usados
    .map((i) => `${emoji(i.taxaAprovacao)} *${pct(i.taxaAprovacao)}%* ${rotulo(i)} (${i.totalMatriculados} alunos)`)
    .join("\n");
}

export const LEGENDA = "_Taxa entre quem foi avaliado; quem trancou conta nos alunos._";

export function pct(taxa: number): number {
  return Math.round(taxa * 100);
}

const MELHOR_PROFESSOR_QUE_O_IMD_TEVE = "maxwell gomes da silva";

export function ehMemorial(nome?: string | null): boolean {
  return (nome ?? "").toLowerCase().includes(MELHOR_PROFESSOR_QUE_O_IMD_TEVE);
}

export function nomeDocente(nome?: string | null): string {
  const n = tituloCase(nome) || "(não informado)";
  return ehMemorial(n) ? `🕊️ ${n} (1993 - 2026)` : n;
}

export const MEMORIAL_TEXTO =
  `🕊️ *In Memoriam de Maxwell Gomes da Silva (1993 - 2026)*\n\n` +
  `Professor querido do BTI, pai e esposo dedicado, sempre lembrado pelo cuidado com cada aluno e cada turma.\n` +
  `Que estas aprovações contem um pouco do educador que ele foi.`;
