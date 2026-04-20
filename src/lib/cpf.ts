/**
 * Gera um CPF válido (passa no dígito verificador).
 * Pagou valida o CPF matematicamente — usamos isso pra evitar expor o CPF
 * real do cliente no gateway.
 */
export function generateValidCpf(): string {
  const base: number[] = [];
  for (let i = 0; i < 9; i++) base.push(Math.floor(Math.random() * 10));

  const digits = base.slice();
  for (let d = 0; d < 2; d++) {
    let sum = 0;
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (digits.length + 1 - i);
    }
    const check = ((sum * 10) % 11) % 10;
    digits.push(check);
  }

  return digits.join("");
}
