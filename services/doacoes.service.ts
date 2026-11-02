import { IAdminAgendaDoacao } from "../interfaces/adminAgendaDoacao.interface";
import { IAdminDoacaoAgendada } from "../interfaces/adminDoacaoAgendada.interface";
import { IAdminHistoricoDoacao } from "../interfaces/adminHistoricoDoacao.interface";
import { IAdminItemRecebido, IAdminSolicitacaoDoacao } from "../interfaces/adminSolicitacao.interface";
import { mockHistoricoDoacoes, mockSolicitacoesDoacao } from "./mocks/doacoes.mock";
import { doadorPorId } from "./mocks/doadores.mock";
import { produtoPorCodigo } from "./mocks/produtos.mock";
import { entradaEstoque } from "./estoque.service";
import { usuarioLogado } from "./sessao";
import { getTodayDate } from "../utils/dateUtils";

// As funções abaixo leem e alteram os mocks (só na memória: voltam ao original com F5).
// Quando a API existir, basta trocar o corpo por um fetch.

const nomeProduto = (codigo: string) => produtoPorCodigo(codigo)?.nome ?? codigo;

// Gerenciar Agendas: propostas pendentes, aprovadas e recusadas
export async function buscarSolicitacoesDoacao(): Promise<IAdminAgendaDoacao[]> {
    return mockSolicitacoesDoacao
        .filter(s => s.status === "pendente" || s.status === "aprovado" || s.status === "recusado")
        .map(s => {
            const d = doadorPorId(s.doadorId);
            return {
                id: s.id,
                doador: d.nome,
                cpfCnpj: d.cpfCnpj,
                telefone: d.telefone,
                item: nomeProduto(s.codigoProduto),
                quantidade: s.quantidade,
                dataProposta: s.dataProposta,
                status: s.status as IAdminAgendaDoacao["status"],
                codigoAgendamento: s.codigoAgendamento,
                observacao: s.observacao,
            };
        });
}

// Calendário: só as doações aprovadas
export async function buscarDoacoesConfirmadas(): Promise<IAdminAgendaDoacao[]> {
    return (await buscarSolicitacoesDoacao()).filter(d => d.status === "aprovado");
}

// Receber Doação: doações aprovadas aguardando o recebimento
export async function buscarDoacoesAgendadas(): Promise<IAdminDoacaoAgendada[]> {
    return mockSolicitacoesDoacao
        .filter(s => s.status === "aprovado")
        .map(s => {
            const d = doadorPorId(s.doadorId);
            return {
                id: s.id,
                codigoAgendamento: s.codigoAgendamento,
                nomeDoador: d.nome,
                cpfCnpj: d.cpfCnpj,
                telefone: d.telefone,
                codigoProduto: s.codigoProduto,
                item: nomeProduto(s.codigoProduto),
                quantidade: s.quantidade,
                dataAgendada: s.dataProposta,
                status: "agendado",
            };
        });
}

// Histórico: doações já recebidas
export async function buscarHistoricoDoacoes(): Promise<IAdminHistoricoDoacao[]> {
    return structuredClone(mockHistoricoDoacoes);
}

function doacaoAprovada(id: number) {
    const doacao = mockSolicitacoesDoacao.find(s => s.id === id);
    if (!doacao || doacao.status !== "aprovado") {
        throw new Error("Esta doação não está mais aguardando recebimento.");
    }
    return doacao;
}

// Receber Doação: confere os itens, dá entrada dos lotes no estoque e registra no histórico
export async function confirmarRecebimento(id: number, itens: IAdminItemRecebido[], observacao: string) {
    const doacao = doacaoAprovada(id);

    if (itens.length === 0) throw new Error("Inclua ao menos um item no recebimento.");
    for (const item of itens) {
        const nome = nomeProduto(item.codigoProduto);
        if (!item.validade) throw new Error(`Informe a validade de ${nome}.`);
        if (!(item.quantidade > 0)) throw new Error(`A quantidade de ${nome} deve ser maior que zero.`);
    }

    // Dá entrada item a item; cada um recebe (ou reaproveita) um lote interno
    const itensHistorico = itens.map(i => {
        const produto = produtoPorCodigo(i.codigoProduto);
        const entrada = entradaEstoque(i.codigoProduto, i.loteFabricante, i.validade, i.quantidade);
        return {
            codigo: i.codigoProduto,
            nome: produto?.nome ?? i.codigoProduto,
            tipo: produto?.tipo ?? "",
            lote: entrada.lote,
            loteFabricante: entrada.loteFabricante,
            quantidade: i.quantidade,
            novo: entrada.novo,
        };
    });

    const doador = doadorPorId(doacao.doadorId);
    mockHistoricoDoacoes.push({
        id: Math.max(0, ...mockHistoricoDoacoes.map(h => h.id)) + 1,
        codigoAgendamento: doacao.codigoAgendamento,
        doador: doador.nome,
        cpfCnpj: doador.cpfCnpj,
        itens: itensHistorico.map(i => ({
            codigo: i.codigo, nome: i.nome, tipo: i.tipo, lote: i.lote, loteFabricante: i.loteFabricante, quantidade: i.quantidade,
        })),
        dataRecebimento: getTodayDate(),
        responsavel: usuarioLogado,
    });

    doacao.status = "recebido";
    doacao.observacao = observacao.trim() || undefined;

    // Para a tela avisar quais lotes internos foram usados
    return itensHistorico.map(i => ({ nome: i.nome, lote: i.lote, novo: i.novo }));
}

// Receber Doação: recusa exige motivo
export async function recusarRecebimento(id: number, motivo: string) {
    const doacao = doacaoAprovada(id);
    if (!motivo.trim()) throw new Error("Informe o motivo da recusa no campo Observações.");
    doacao.status = "recusado";
    doacao.observacao = motivo.trim();
}

// ---- Gerenciar Agendas ----

function proposta(id: number, statusEsperado: IAdminSolicitacaoDoacao["status"][]) {
    const s = mockSolicitacoesDoacao.find(x => x.id === id);
    if (!s || !statusEsperado.includes(s.status)) throw new Error("Esta proposta foi alterada. Atualize a página.");
    return s;
}

export async function aprovarDoacao(id: number, dataProposta: string, observacao: string) {
    const s = proposta(id, ["pendente"]);
    if (!dataProposta) throw new Error("Informe a data de entrega.");
    if (dataProposta < getTodayDate()) throw new Error("A data de entrega não pode estar no passado.");
    s.dataProposta = dataProposta;
    s.status = "aprovado";
    s.observacao = observacao.trim() || undefined;
}

// Recusa: exige motivo (fica registrado para auditoria)
export async function recusarDoacao(id: number, motivo: string) {
    const s = proposta(id, ["pendente"]);
    if (!motivo.trim()) throw new Error("Informe o motivo da recusa.");
    s.status = "recusado";
    s.observacao = motivo.trim();
}

export async function reabrirDoacao(id: number) {
    const s = proposta(id, ["aprovado", "recusado"]);
    s.status = "pendente";
}
