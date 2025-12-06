import { logger } from "./logger.service";

export class CooldownService {
  private static instance: CooldownService;
  private cooldowns = new Map<string, number>();
  private readonly COOLDOWN_SECONDS_PRIVATE = 30;
  private readonly COOLDOWN_SECONDS_GROUP = 60;

  private constructor() {
    setInterval(
      () => this.clearExpiredCooldowns(),
      30 * 1000
    );
    logger.info("Sistema de cooldown inicializado");
  }

  public static getInstance(): CooldownService {
    if (!CooldownService.instance) {
      CooldownService.instance = new CooldownService();
    }
    return CooldownService.instance;
  }

  private getCooldownKey(
    userId: string,
    commandName: string,
    subCommand?: string
  ): string {
    return subCommand
      ? `${userId}:${commandName}:${subCommand}`
      : `${userId}:${commandName}`;
  }

  public checkCooldown(
    userId: string,
    commandName: string,
    subCommand?: string,
    isGroup: boolean = false
  ): number {
    const cooldownKey = this.getCooldownKey(userId, commandName, subCommand);
    const expirationTime = this.cooldowns.get(cooldownKey);
    if (expirationTime && Date.now() < expirationTime) {
      return Math.ceil((expirationTime - Date.now()) / 1000);
    }
    return 0;
  }

  public setCooldown(
    userId: string,
    commandName: string,
    subCommand?: string,
    isGroup: boolean = false
  ): void {
    const cooldownKey = this.getCooldownKey(userId, commandName, subCommand);
    const cooldownTime = isGroup ? this.COOLDOWN_SECONDS_GROUP : this.COOLDOWN_SECONDS_PRIVATE;
    const expirationTime = Date.now() + cooldownTime * 1000;
    this.cooldowns.set(cooldownKey, expirationTime);
  }

  private clearExpiredCooldowns(): void {
    const now = Date.now();
    this.cooldowns.forEach((expirationTime, key) => {
      if (now > expirationTime) {
        this.cooldowns.delete(key);
      }
    });
  }
}
