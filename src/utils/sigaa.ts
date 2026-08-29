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

export interface Indice {
  sigla: string;
  valor: string;
  nome: string;
}

export interface Nota {
  codigo: string;
  disciplina: string;
  unidades: string[];
  recuperacao: string;
  resultado: string;
  faltas: string;
  situacao: string;
}

export interface Periodo {
  periodo: string;
  notas: Nota[];
}

export interface DadosSigaa {
  turmas: Turma[];
  indices: Indice[];
  institucional: Record<string, string>;
  integralizado: number | null;
  boletim: Periodo[];
  atualizadoEm: string;
}

/** Ordena os periodos do mais recente pro mais antigo. "2026.1" > "2025.2". */
export function periodosRecentes(boletim: Periodo[]): Periodo[] {
  const peso = (p: string) => {
    const m = /(\d{4})\.(\d)/.exec(p);
    return m ? Number(m[1]) * 10 + Number(m[2]) : 0;
  };
  return [...boletim].sort((a, b) => peso(b.periodo) - peso(a.periodo));
}

/** Emoji e rotulo curto a partir da situacao crua do SIGAA. */
export function situacaoDe(nota: Nota): { icone: string; rotulo: string; fechada: boolean } {
  const s = (nota.situacao || "").toUpperCase();
  if (s.includes("APROVAD")) return { icone: "✅", rotulo: "Aprovado", fechada: true };
  if (s.includes("REPROV")) return { icone: "❌", rotulo: "Reprovado", fechada: true };
  if (s.includes("TRANC")) return { icone: "🚫", rotulo: "Trancado", fechada: true };
  return { icone: "📖", rotulo: "Em curso", fechada: false };
}

/** So as unidades preenchidas, juntas com ponto. Ex: ["8.5","","9.0"] -> "8.5 · 9.0". */
export function unidades(nota: Nota): string {
  return (nota.unidades || []).map((u) => u.trim()).filter(Boolean).join(" · ");
}

export async function buscarDados(jid: string): Promise<DadosSigaa> {
  const { data } = await cli.get("/dados", { params: { jid } });
  return data as DadosSigaa;
}

export function precisaConectar(err: unknown): boolean {
  return (err as { response?: { status?: number } })?.response?.status === 401;
}

const DIAS = ["", "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ORDEM_DIA = [2, 3, 4, 5, 6, 7, 1]; // Seg..Sab, Dom por ultimo

// Grade oficial da UFRN: inicio de cada slot e fim do slot anterior ao intervalo.
const INICIO: Record<string, string[]> = {
  M: ["", "07h00", "07h50", "08h55", "09h45", "10h50", "11h40"],
  T: ["", "13h00", "13h50", "14h55", "15h45", "16h50", "17h40"],
  N: ["", "18h45", "19h35", "20h35", "21h25"],
};
const FIM: Record<string, string[]> = {
  M: ["", "07h50", "08h40", "09h45", "10h35", "11h40", "12h30"],
  T: ["", "13h50", "14h40", "15h45", "16h35", "17h40", "18h30"],
  N: ["", "19h35", "20h25", "21h25", "22h15"],
};

export interface Bloco {
  dias: number[];
  ini: string;
  fim: string;
}

/** "35N12" ou "35N12 246T34" -> blocos com dias e hora real. */
export function parseHorario(codigo: string): Bloco[] {
  const out: Bloco[] = [];
  for (const parte of codigo.trim().split(/\s+/)) {
    const m = /^(\d+)([MTN])(\d+)$/.exec(parte);
    if (!m) continue;
    const dias = m[1].split("").map(Number).filter((d) => d >= 1 && d <= 7);
    const turno = m[2];
    const slots = m[3].split("").map(Number);
    const ini = INICIO[turno]?.[slots[0]] ?? "";
    const fim = FIM[turno]?.[slots[slots.length - 1]] ?? "";
    if (dias.length && ini && fim) out.push({ dias, ini, fim });
  }
  return out;
}

/** Faixa de hora de um codigo, sem os dias. Ex: "35N12" -> "18h45–20h25". */
export function faixaHora(codigo: string): string {
  const b = parseHorario(codigo)[0];
  return b ? `${b.ini}\u2013${b.fim}` : codigo;
}

/** Separa o local real do topico que o SIGAA cola junto em "Topicos Especiais". */
export function limpar(t: Turma): { nome: string; local: string; nota?: string } {
  const partes = t.local.split(/\s*-\s*/).map((x) => x.trim()).filter(Boolean);
  let local = t.local;
  let nome = t.nome;
  let nota: string | undefined;
  if (partes.length >= 3 && /t[oó]picos? especiais/i.test(t.nome)) {
    local = partes.slice(0, 2).join(" - ");
    nome = partes.slice(2).join(" - ");
    nota = "Tóp. Especiais";
  }
  return { nome, local, nota };
}

export interface EntradaDia {
  ini: string;
  fim: string;
  nome: string;
  local: string;
  nota?: string;
}

/** Monta a agenda: cada dia com suas turmas, ordenadas por hora. Turma de 2 dias aparece nos 2. */
export function agenda(turmas: Turma[]): { dias: [number, EntradaDia[]][]; online: string[] } {
  const porDia = new Map<number, EntradaDia[]>();
  const online: string[] = [];
  for (const t of turmas) {
    const { nome, local, nota } = limpar(t);
    const blocos = parseHorario(t.horario);
    if (blocos.length === 0) {
      online.push(nota ? `${nome} (${nota})` : nome);
      continue;
    }
    for (const b of blocos) {
      for (const d of b.dias) {
        if (!porDia.has(d)) porDia.set(d, []);
        porDia.get(d)!.push({ ini: b.ini, fim: b.fim, nome, local, nota });
      }
    }
  }
  const dias: [number, EntradaDia[]][] = [];
  for (const d of ORDEM_DIA) {
    const lista = porDia.get(d);
    if (!lista) continue;
    lista.sort((a, b) => a.ini.localeCompare(b.ini));
    dias.push([d, lista]);
  }
  return { dias, online };
}

export function nomeDia(d: number): string {
  return ["", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][d] ?? DIAS[d];
}

/** "há 2 h", "há 3 dias", "agora" a partir de um ISO. */
export function desde(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 2) return "agora há pouco";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d === 1 ? "" : "s"}`;
}
