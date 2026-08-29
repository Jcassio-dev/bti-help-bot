import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { buscarTurmas, horarioLegivel, precisaConectar } from "../utils/sigaa";

export default class TurmasCommand extends BaseCommand {
  name = "turmas";
  description = "Suas turmas do semestre no SIGAA, com horário.";
  aliases = ["minhasturmas"];
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
      const linhas = turmas.map((t) => {
        const cod = t.codigo ? `*${t.codigo}* ` : "";
        const local = t.local ? ` — ${t.local}` : "";
        return `${cod}${t.nome}\n  ${horarioLegivel(t.horario)}${local}`;
      });
      return `*Suas turmas do semestre*\n\n${linhas.join("\n\n")}\n\n_Fonte: SIGAA. Atualize com !atualizar._`;
    } catch (e) {
      if (precisaConectar(e)) {
        return "Você não está conectado ao SIGAA. Use *!conectar* pra começar.";
      }
      return "O SIGAA não respondeu agora. Tenta de novo em instantes.";
    }
  }
}
