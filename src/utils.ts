export const withZero = (n?: number, length: number = 2): string =>
  String(n).padStart(length, '0')
