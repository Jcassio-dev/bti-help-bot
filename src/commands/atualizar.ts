import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { BaseCommand } from "../types/command";
import { atualizar } from "../utils/sigaa";

export default class AtualizarCommand extends BaseCommand {
  name = "atualizar";
  description = "Descarta o cache e busca seus dados do SIGAA de novo.";
  aliases = ["sincronizar"];
  privateRestricted = true;
  loggable = false;
  acesso: "tester" = "tester";

  async execute(
    _sock: WASocket,
    msg: WAMessage
  ): Promise<AnyMessageContent | string | null | undefined> {
    const jid = msg.key.remoteJid!;
    try {
      await atualizar(jid);
      return "Pronto, na próxima consulta eu busco tudo de novo no SIGAA.";
    } catch (e) {
      return "Não consegui agora. Tenta de novo em instantes.";
    }
  }
}
