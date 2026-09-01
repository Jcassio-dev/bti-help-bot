import { AnyMessageContent, WAMessage, WASocket } from "baileys";
import { Nivel } from "../core/permissoes";

export abstract class BaseCommand {
  public abstract name: string;
  public abstract description?: string;
  public abstract aliases?: string[];
  public abstract privateRestricted?: boolean;
  public abstract loggable?: boolean;
  public hidden?: boolean;
  /** Quem pode usar. Ausente = todos. "tester" e "admin" checados contra as listas do .env. */
  public acesso?: Nivel;
  /** Seção do menu. Ausente = seção geral. */
  public categoria?: string;

  public abstract execute(
    sock: WASocket,
    msg: WAMessage,
    args: string[],
    allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined>;
}

export interface Command extends BaseCommand {}
