import { AnyMessageContent, WAMessage, WASocket } from "baileys";

export abstract class BaseCommand {
  public abstract name: string;
  public abstract description?: string;
  public abstract aliases?: string[];
  public abstract privateRestricted?: boolean;
  public abstract loggable?: boolean;

  public abstract execute(
    sock: WASocket,
    msg: WAMessage,
    args: string[],
    allCommands?: Map<string, BaseCommand>
  ): Promise<AnyMessageContent | string | null | undefined>;
}

export interface Command extends BaseCommand {}
