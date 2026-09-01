import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { desconectar } from "../utils/sigaa";

export default class DesconectarCommand extends BaseCommand {
  name = "desconectar";
  description = "Apaga os dados do SIGAA guardados no bot.";
  aliases = ["sair", "esquecer"];
  privateRestricted = true;
  loggable = false;
  categoria = "SIGAA";

  async execute(
    _sock: WASocket,
    msg: WAMessage
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.participant || msg.key.remoteJid!;
    try {
      await desconectar(jid);
      return "Prontinho: apaguei a cópia guardada dos seus dados acadêmicos. Sessão e senha nunca são guardadas. Use *!conectar* quando quiser voltar.";
    } catch (e) {
      return "Não consegui agora. Tenta de novo em instantes.";
    }
  }
}
