import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import {
  buscarDados,
  desde,
  periodosRecentes,
  precisaConectar,
  situacaoDe,
  unidades,
  Periodo,
} from "../utils/sigaa";

export default class NotasCommand extends BaseCommand {
  name = "notas";
  description = "Suas notas do semestre no SIGAA.";
  aliases = ["boletim", "nota"];
  privateRestricted = true;
  loggable = false;

  async execute(
    _sock: WASocket,
    msg: WAMessage,
    args: string[]
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      const dados = await buscarDados(jid);
      const periodos = periodosRecentes(dados.boletim || []);
      if (periodos.length === 0) {
        return "Não achei notas na sua última coleta. Mande *!conectar* pra atualizar.";
      }

      const rodape = `_Último registro ${desde(dados.atualizadoEm)}. Atualize com !conectar._`;

      const arg = (args[0] || "").toLowerCase();
      if (arg === "tudo" || arg === "historico" || arg === "histórico") {
        return `${this.historico(periodos)}\n\n${rodape}`;
      }

      const alvo = /^\d{4}\.\d$/.test(arg)
        ? periodos.find((p) => p.periodo === arg)
        : periodos[0];
      if (!alvo) {
        return `Não achei o período *${arg}*. Períodos disponíveis: ${periodos
          .map((p) => p.periodo)
          .join(", ")}.`;
      }

      const outros =
        periodos.length > 1
          ? `\n\n_Veja um período com *!notas 2025.1* ou tudo com *!notas tudo*._`
          : "";

      return `${this.periodo(alvo)}${outros}\n\n${rodape}`;
    } catch (e) {
      if (precisaConectar(e)) {
        return "Você não está conectado ao SIGAA. Use *!conectar* pra começar.";
      }
      return "Não consegui buscar suas notas agora. Tenta de novo em instantes.";
    }
  }

  private periodo(p: Periodo): string {
    const blocos = p.notas.map((n) => {
      const { rotulo, fechada } = situacaoDe(n);
      const linhas = [`*${n.disciplina}*`];
      const u = unidades(n);
      if (u) linhas.push(`Unidades: ${u}`);
      if (n.recuperacao?.trim()) linhas.push(`Recuperação: ${n.recuperacao.trim()}`);
      if (fechada) {
        const nota = n.resultado?.trim();
        linhas.push(nota ? `Resultado: ${nota} (${rotulo})` : rotulo);
      } else {
        linhas.push(`_${rotulo}_`);
      }
      return linhas.join("\n");
    });
    return `*Boletim ${p.periodo}*\n\n${blocos.join("\n\n")}`;
  }

  private historico(periodos: Periodo[]): string {
    const blocos = periodos.map((p) => {
      const itens = p.notas.map((n) => {
        const { rotulo } = situacaoDe(n);
        const nota = n.resultado?.trim();
        return `${n.disciplina}: ${nota || rotulo}`;
      });
      return `*${p.periodo}*\n${itens.join("\n")}`;
    });
    return `*Histórico de notas*\n\n${blocos.join("\n\n")}`;
  }
}
