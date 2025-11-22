const cooldowns = new Map<string, number>();
const COOLDOWN_SECONDS = 30;

function getCooldownKey(
  userId: string,
  commandName: string,
  subCommand?: string
): string {
  return subCommand
    ? `${userId}:${commandName}:${subCommand}`
    : `${userId}:${commandName}`;
}

export function checkCooldown(
  userId: string,
  commandName: string,
  subCommand?: string
): number {
  const cooldownKey = getCooldownKey(userId, commandName, subCommand);
  const expirationTime = cooldowns.get(cooldownKey);

  if (expirationTime && Date.now() < expirationTime) {
    const timeLeft = (expirationTime - Date.now()) / 1000;
    return Math.ceil(timeLeft);
  }

  return 0;
}

export function setCooldown(
  userId: string,
  commandName: string,
  subCommand?: string
): void {
  const cooldownKey = getCooldownKey(userId, commandName, subCommand);
  const expirationTime = Date.now() + COOLDOWN_SECONDS * 1000;
  cooldowns.set(cooldownKey, expirationTime);
}

function clearExpiredCooldowns() {
  const now = Date.now();
  cooldowns.forEach((expirationTime, key) => {
    if (now > expirationTime) {
      cooldowns.delete(key);
    }
  });
}

setInterval(clearExpiredCooldowns, COOLDOWN_SECONDS * 1000);

console.log("[COOLDOWN] Sistema de cooldown inicializado.");
