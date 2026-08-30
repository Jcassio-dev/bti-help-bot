import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { agenda, buscarDados, desde, nomeDia, precisaConectar } from "../utils/sigaa";

export default class TurmasCommand extends BaseCommand {
  name = "turmas";
  description = "Sua agenda de turmas do semestre no SIGAA.";
  aliases = ["minhasturmas", "agenda"];
  privateRestricted = true;
  loggable = false;
  acesso: "tester" = "tester";

  async execute(
    _sock: WASocket,
    msg: WAMessage
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      const dados = await buscarDados(jid);
      if (dados.turmas.length === 0) {
        return "Não achei turmas na sua última coleta. Se acabou de se matricular, mande *!conectar* pra atualizar.";
      }

      const { dias, online } = agenda(dados.turmas);
      const partes: string[] = [];
      for (const [dia, lista] of dias) {
        const linhas = lista.map((e) => {
          const nome = e.nota ? `${e.nome} _(${e.nota})_` : e.nome;
          const local = e.local ? ` · ${e.local}` : "";
          return `\`${e.ini}–${e.fim}\`  ${nome}${local}`;
        });
        partes.push(`*${nomeDia(dia)}*\n${linhas.join("\n")}`);
      }
      if (online.length) {
        partes.push(`*Online*\n${online.map((n) => `• ${n}`).join("\n")}`);
      }

      return (
        `*Minha agenda de turmas*\n\n${partes.join("\n\n")}\n\n` +
        `_Último registro ${desde(dados.atualizadoEm)}. Atualize com !conectar._`
      );
    } catch (e) {
      if (precisaConectar(e)) {
        return "Você não está conectado ao SIGAA. Use *!conectar* pra começar.";
      }
      return "Não consegui buscar seus dados agora. Tenta de novo em instantes.";
    }
  }
}
