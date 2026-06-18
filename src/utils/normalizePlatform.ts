export function normalizePlatform(platform: string) {
  return platform
    .trim()
    .toUpperCase()
    .replace(/[-_\s]+/g, "_");
}
