export function webpOf(pngPath: string): string {
  return pngPath.replace(/\.png$/i, ".webp");
}
