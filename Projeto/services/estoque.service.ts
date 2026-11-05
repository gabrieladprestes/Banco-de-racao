import { IAdminEstoque } from "../interfaces/adminEstoque.interface";
import { IAdminLoteEntregue } from "../interfaces/adminSolicitacao.interface";
import { mockEstoque } from "./mocks/estoque.mock";
import { mockSolicitacoesRetirada } from "./mocks/retiradas.mock";
import { produtoPorCodigo } from "./mocks/produtos.mock";
import { disponivelParaLiberar, loteCorrespondente, prefixoLote, statusValidade, totalReservado } from "../utils/estoqueUtils";

// As funções abaixo leem e alteram os mocks (só na memória: voltam ao original com F5).
// Quando a API existir, basta trocar o corpo por um fetch.
//
// Reserva: quando uma retirada é aprovada, a quantidade fica reservada para ela.
// A reserva vale para o produto; nos lotes ela é distribuída sempre a partir do que
// vence primeiro (redistribuirReserva), para os números fecharem mesmo que a entrega
// saia de outro lote.

export async function buscarEstoque(): Promise<IAdminEstoque[]> {
    // Devolve uma cópia, para a tela não alterar os dados sem passar pelo service
    return structuredClone(mockEstoque);
}

// ---- Uso interno dos services de doações e retiradas ----

function itemDoEstoque(codigoProduto: string) {
    let item = mockEstoque.find(e => e.codigo === codigoProduto);
    if (!item) {
        const produto = produtoPorCodigo(codigoProduto);
        if (!produto) throw new Error(`Produto ${codigoProduto} não está cadastrado.`);
        item = { id: produto.id, codigo: produto.codigo, nome: produto.nome, tipo: produto.tipo, lotes: [] };
        mockEstoque.push(item);
    }
    return item;
}

// Espalha o total reservado pelos lotes válidos, do que vence primeiro ao último
function redistribuirReserva(item: IAdminEstoque, total: number) {
    let falta = total;
    const ordem = [...item.lotes].sort((a, b) => a.validade.localeCompare(b.validade));
    for (const lote of ordem) {
        const pode = statusValidade(lote.validade) === "vencido" ? 0 : Math.min(lote.saldoEstoque, falta);
        lote.saldoReservado = pode;
        falta -= pode;
    }
}

// Disponível para novas aprovações: lotes válidos menos o que já está reservado
export function disponivelProduto(codigoProduto: string) {
    const item = mockEstoque.find(e => e.codigo === codigoProduto);
    return item ? disponivelParaLiberar(item.lotes) : 0;
}

export function reservarEstoque(codigoProduto: string, quantidade: number) {
    const item = itemDoEstoque(codigoProduto);
    if (quantidade > disponivelParaLiberar(item.lotes)) {
        throw new Error(`${item.nome}: estoque disponível insuficiente (disponível ${disponivelParaLiberar(item.lotes)}).`);
    }
    redistribuirReserva(item, totalReservado(item.lotes) + quantidade);
}

export function liberarReserva(codigoProduto: string, quantidade: number) {
    const item = itemDoEstoque(codigoProduto);
    redistribuirReserva(item, Math.max(totalReservado(item.lotes) - quantidade, 0));
}

// Próximo lote interno do tipo (L007, M004...). A numeração é única no estoque todo.
function proximoLoteInterno(tipo: string) {
    const prefixo = prefixoLote(tipo);
    const numeros = mockEstoque
        .flatMap(e => e.lotes)
        .filter(l => l.lote.startsWith(prefixo))
        .map(l => Number(l.lote.slice(prefixo.length)) || 0);
    return `${prefixo}${String(Math.max(0, ...numeros) + 1).padStart(3, "0")}`;
}

// Entrada no estoque. Mesmo lote do fabricante + mesma validade soma no lote interno existente;
// caso contrário, gera um lote interno novo. Devolve o lote interno usado.
export function entradaEstoque(codigoProduto: string, loteFabricante: string, validade: string, quantidade: number) {
    const item = itemDoEstoque(codigoProduto);
    const reservado = totalReservado(item.lotes);
    const existente = loteCorrespondente(item.lotes, loteFabricante, validade);
    let resultado;
    if (existente) {
        existente.saldoEstoque += quantidade;
        resultado = { lote: existente.lote, loteFabricante: existente.loteFabricante, novo: false };
    } else {
        const lote = proximoLoteInterno(item.tipo);
        const fabricante = loteFabricante.trim().toUpperCase() || undefined;
        item.lotes.push({ lote, loteFabricante: fabricante, saldoEstoque: quantidade, saldoReservado: 0, validade });
        resultado = { lote, loteFabricante: fabricante, novo: true };
    }
    redistribuirReserva(item, reservado);
    return resultado;
}

// Quanto uma retirada aprovada pode levar: o disponível + a reserva que já é dela
export function disponivelParaEntrega(codigoProduto: string, reservaPropria: number) {
    return disponivelProduto(codigoProduto) + reservaPropria;
}

// Confere se a saída pode ser feita dos lotes escolhidos (sem alterar nada)
export function validarSaida(codigoProduto: string, lotes: IAdminLoteEntregue[], reservaPropria: number) {
    const item = itemDoEstoque(codigoProduto);
    const vistos = new Set<string>();
    for (const escolhido of lotes) {
        const lote = item.lotes.find(l => l.lote === escolhido.lote);
        if (!lote) throw new Error(`${item.nome}: escolha um lote válido.`);
        if (vistos.has(lote.lote)) throw new Error(`${item.nome}: o lote ${lote.lote} foi escolhido mais de uma vez.`);
        vistos.add(lote.lote);
        if (statusValidade(lote.validade) === "vencido") throw new Error(`${item.nome}: o lote ${lote.lote} está vencido.`);
        if (!(escolhido.quantidade > 0)) throw new Error(`${item.nome}: informe a quantidade do lote ${lote.lote}.`);
        if (escolhido.quantidade > lote.saldoEstoque) {
            throw new Error(`${item.nome}: o lote ${lote.lote} só tem ${lote.saldoEstoque} em estoque.`);
        }
    }
    // Não pode consumir a reserva de outras retiradas aprovadas
    const total = lotes.reduce((acc, l) => acc + l.quantidade, 0);
    const limite = disponivelParaEntrega(codigoProduto, reservaPropria);
    if (total > limite) {
        throw new Error(`${item.nome}: só ${limite} podem sair; o restante está reservado para outras retiradas.`);
    }
}

// Baixa nos lotes escolhidos: libera a reserva desta retirada e tira dos lotes
export function baixaEstoque(codigoProduto: string, lotes: IAdminLoteEntregue[], reservaPropria: number) {
    validarSaida(codigoProduto, lotes, reservaPropria);
    const item = itemDoEstoque(codigoProduto);
    const reservaRestante = Math.max(totalReservado(item.lotes) - reservaPropria, 0);
    const usados = lotes.map(escolhido => {
        const lote = item.lotes.find(l => l.lote === escolhido.lote)!;
        lote.saldoEstoque -= escolhido.quantidade;
        return { lote: lote.lote, loteFabricante: lote.loteFabricante, quantidade: escolhido.quantidade };
    });
    redistribuirReserva(item, reservaRestante);
    return usados;
}

// ---- Dados de teste: a reserva inicial é a soma das retiradas já aprovadas ----
(function inicializarReservas() {
    const reservaPorProduto = new Map<string, number>();
    mockSolicitacoesRetirada
        .filter(s => s.status === "aprovado")
        .flatMap(s => s.itens)
        .forEach(i => reservaPorProduto.set(i.codigoProduto, (reservaPorProduto.get(i.codigoProduto) ?? 0) + i.quantidade));
    mockEstoque.forEach(item => redistribuirReserva(item, reservaPorProduto.get(item.codigo) ?? 0));
})();
