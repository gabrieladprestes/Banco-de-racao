import { IAdminEstoqueLote } from "../interfaces/adminEstoque.interface";
import { diasAte } from "./dateUtils";

export type StatusValidade = "vencido" | "vencendo" | "bom";

export function statusValidade(validade: string): StatusValidade {
    const diffDias = diasAte(validade);
    if (diffDias < 0) return "vencido";
    if (diffDias <= 30) return "vencendo";
    return "bom";
}

export function statusGeral(lotes: IAdminEstoqueLote[]): StatusValidade {
    const statuses = lotes.map(l => statusValidade(l.validade));
    if (statuses.includes("vencido")) return "vencido";
    if (statuses.includes("vencendo")) return "vencendo";
    return "bom";
}

export function totalEstoque(lotes: IAdminEstoqueLote[]) {
    return lotes.reduce((acc, l) => acc + l.saldoEstoque, 0);
}

export function totalReservado(lotes: IAdminEstoqueLote[]) {
    return lotes.reduce((acc, l) => acc + l.saldoReservado, 0);
}

// Saldo físico em lotes dentro da validade (inclui o que está reservado).
// Usado na Saída de Doação: a retirada já foi aprovada, então pode usar a própria reserva.
export function saldoValido(lotes: IAdminEstoqueLote[]) {
    return lotes
        .filter(l => statusValidade(l.validade) !== "vencido")
        .reduce((acc, l) => acc + l.saldoEstoque, 0);
}

// O que pode ser entregue: só lotes dentro da validade, descontando o reservado
export function disponivelParaLiberar(lotes: IAdminEstoqueLote[]) {
    return lotes
        .filter(l => statusValidade(l.validade) !== "vencido")
        .reduce((acc, l) => acc + Math.max(l.saldoEstoque - l.saldoReservado, 0), 0);
}

// ---- Lotes ----

export const textoLoteFabricante = (lote?: string) => lote?.trim() || "Não informado";

// Lotes que podem sair: dentro da validade, com saldo, do que vence primeiro para o último
export function lotesParaSaida(lotes: IAdminEstoqueLote[]) {
    return lotes
        .filter(l => statusValidade(l.validade) !== "vencido" && l.saldoEstoque > 0)
        .sort((a, b) => a.validade.localeCompare(b.validade));
}

// Sugestão de saída: começa pelo lote que vence primeiro e passa para o próximo se faltar
export function sugerirLotesSaida(lotes: IAdminEstoqueLote[], quantidade: number) {
    const sugestao: { lote: string; quantidade: number }[] = [];
    let falta = quantidade;
    for (const l of lotesParaSaida(lotes)) {
        if (falta <= 0) break;
        const tirar = Math.min(l.saldoEstoque, falta);
        sugestao.push({ lote: l.lote, quantidade: tirar });
        falta -= tirar;
    }
    return sugestao;
}

// Regra de entrada: mesmo lote do fabricante + mesma validade = mesmo lote interno.
// Sem lote do fabricante, sempre gera um lote interno novo.
export function loteCorrespondente(lotes: IAdminEstoqueLote[], loteFabricante: string, validade: string) {
    const fabricante = loteFabricante.trim().toUpperCase();
    if (!fabricante || !validade) return undefined;
    return lotes.find(l => (l.loteFabricante ?? "").toUpperCase() === fabricante && l.validade === validade);
}

// Prefixo do lote interno por tipo de produto (mantém o padrão L001, M001, P001)
const PREFIXO_POR_TIPO: Record<string, string> = { "Ração": "L", "Medicamento": "M", "Petisco": "P" };
export const prefixoLote = (tipo: string) => PREFIXO_POR_TIPO[tipo] ?? "O";
