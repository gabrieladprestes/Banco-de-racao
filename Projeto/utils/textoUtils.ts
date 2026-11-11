export const somenteDigitos = (texto: string) => texto.replace(/\D/g, "");

// CPF (11 dígitos) ou CNPJ (14 dígitos), só pela quantidade de dígitos
export const documentoValido = (texto: string) => [11, 14].includes(somenteDigitos(texto).length);

// "12345678901" -> "123.456.789-01" · "12345678000199" -> "12.345.678/0001-99"
export function formatarDocumento(texto: string) {
    const d = somenteDigitos(texto);
    if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    return texto.trim();
}
