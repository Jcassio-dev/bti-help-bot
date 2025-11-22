export class CooldownService {
  private static instance: CooldownService;
  private cooldowns = new Map<string, number>();
  private readonly COOLDOWN_SECONDS = 30;

  private constructor() {
    setInterval(
      () => this.clearExpiredCooldowns(),
      this.COOLDOWN_SECONDS * 1000
    );
    console.log("[COOLDOWN] Sistema de cooldown inicializado.");
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
    subCommand?: string
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
    subCommand?: string
  ): void {
    const cooldownKey = this.getCooldownKey(userId, commandName, subCommand);
    const expirationTime = Date.now() + this.COOLDOWN_SECONDS * 1000;
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
