import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { agenda, buscarTurmas, nomeDia, precisaConectar } from "../utils/sigaa";

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
    const isGroup = msg.key.remoteJid?.endsWith("@g.us") ?? false;
    if (isGroup) {
      return "Esse comando é só no privado. Me chama aqui: wa.me/558486735862";
    }

    const jid = msg.key.remoteJid!;
    try {
      const turmas = await buscarTurmas(jid);
      if (turmas.length === 0) {
        return "Não achei turmas neste semestre. Se acabou de se matricular, tenta *!atualizar*.";
      }

      const { dias, online } = agenda(turmas);
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

      return `*Minha agenda de turmas*\n\n${partes.join("\n\n")}\n\n_Fonte: SIGAA. Atualize com !atualizar._`;
    } catch (e) {
      if (precisaConectar(e)) {
        return "Você não está conectado ao SIGAA. Use *!conectar* pra começar.";
      }
      return "O SIGAA não respondeu agora. Tenta de novo em instantes.";
    }
  }
}
