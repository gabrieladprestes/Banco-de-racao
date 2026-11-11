import { IAdminAgendaDoacao } from "../interfaces/adminAgendaDoacao.interface";
import { IAdminDoacaoAgendada } from "../interfaces/adminDoacaoAgendada.interface";
import { IAdminHistoricoDoacao } from "../interfaces/adminHistoricoDoacao.interface";
import { IAdminDoadorNaoCadastrado, IAdminItemRecebido, IAdminSolicitacaoDoacao } from "../interfaces/adminSolicitacao.interface";
import { mockHistoricoDoacoes, mockSolicitacoesDoacao } from "./mocks/doacoes.mock";
import { doadorPorId } from "./mocks/doadores.mock";
import { produtoPorCodigo } from "./mocks/produtos.mock";
import { entradaEstoque } from "./estoque.service";
import { usuarioLogado } from "./sessao";
import { getTodayDate } from "../utils/dateUtils";
import { documentoValido, formatarDocumento } from "../utils/textoUtils";

// As funções abaixo leem e alteram os mocks (só na memória: voltam ao original com F5).
// Quando a API existir, basta trocar o corpo por um fetch.

const nomeProduto = (codigo: string) => produtoPorCodigo(codigo)?.nome ?? codigo;
const unidadeProduto = (codigo: string) => produtoPorCodigo(codigo)?.unidade ?? "kg";

// Nome, documento e telefone de quem doou: do cadastro ou o que foi anotado no balcão
export function dadosDoador(s: IAdminSolicitacaoDoacao) {
    if (s.doadorId !== undefined) return doadorPorId(s.doadorId);
    const d = s.doadorNaoCadastrado;
    return { nome: d?.nome ?? "Doador não identificado", cpfCnpj: d?.documento ?? "", telefone: d?.telefone ?? "" };
}

// Gerenciar Agendas: propostas pendentes, aprovadas e recusadas
export async function buscarSolicitacoesDoacao(): Promise<IAdminAgendaDoacao[]> {
    return mockSolicitacoesDoacao
        .filter(s => s.status === "pendente" || s.status === "aprovado" || s.status === "recusado")
        .map(s => {
            const d = dadosDoador(s);
            return {
                id: s.id,
                doador: d.nome,
                cpfCnpj: d.cpfCnpj,
                telefone: d.telefone,
                item: nomeProduto(s.codigoProduto),
                quantidade: s.quantidade,
                unidade: unidadeProduto(s.codigoProduto),
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

// Atendimento (aba Doação): doações aprovadas aguardando o recebimento
export async function buscarDoacoesAgendadas(): Promise<IAdminDoacaoAgendada[]> {
    return mockSolicitacoesDoacao
        .filter(s => s.status === "aprovado")
        .map(s => {
            const d = dadosDoador(s);
            return {
                id: s.id,
                codigoAgendamento: s.codigoAgendamento,
                nomeDoador: d.nome,
                cpfCnpj: d.cpfCnpj,
                telefone: d.telefone,
                codigoProduto: s.codigoProduto,
                item: nomeProduto(s.codigoProduto),
                quantidade: s.quantidade,
                unidade: unidadeProduto(s.codigoProduto),
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

function validarItens(itens: IAdminItemRecebido[]) {
    if (itens.length === 0) throw new Error("Inclua ao menos um item no recebimento.");
    for (const item of itens) {
        if (!item.codigoProduto) throw new Error("Escolha o produto de todos os itens.");
        const nome = nomeProduto(item.codigoProduto);
        if (!item.validade) throw new Error(`Informe a validade de ${nome}.`);
        if (!(item.quantidade > 0)) throw new Error(`A quantidade de ${nome} deve ser maior que zero.`);
    }
}

// Dá entrada item a item; cada um recebe (ou reaproveita) um lote interno
function darEntrada(itens: IAdminItemRecebido[]) {
    return itens.map(i => {
        const produto = produtoPorCodigo(i.codigoProduto);
        const entrada = entradaEstoque(i.codigoProduto, i.loteFabricante, i.validade, i.quantidade);
        return {
            codigo: i.codigoProduto,
            nome: produto?.nome ?? i.codigoProduto,
            tipo: produto?.tipo ?? "",
            lote: entrada.lote,
            loteFabricante: entrada.loteFabricante,
            quantidade: i.quantidade,
            unidade: produto?.unidade ?? "kg",
            novo: entrada.novo,
        };
    });
}

// Grava no histórico de doações recebidas
function registrarNoHistorico(doacao: IAdminSolicitacaoDoacao, itensHistorico: ReturnType<typeof darEntrada>) {
    const doador = dadosDoador(doacao);
    mockHistoricoDoacoes.push({
        id: Math.max(0, ...mockHistoricoDoacoes.map(h => h.id)) + 1,
        codigoAgendamento: doacao.codigoAgendamento,
        doador: doador.nome,
        cpfCnpj: doador.cpfCnpj,
        itens: itensHistorico.map(i => ({
            codigo: i.codigo, nome: i.nome, tipo: i.tipo, lote: i.lote, loteFabricante: i.loteFabricante, quantidade: i.quantidade, unidade: i.unidade,
        })),
        dataRecebimento: getTodayDate(),
        responsavel: usuarioLogado,
        semAgendamento: doacao.semAgendamento,
        doadorNaoCadastrado: doacao.doadorId === undefined || undefined,
    });
}

// Recebimento de doação agendada: confere os itens, dá entrada dos lotes no estoque e registra no histórico
export async function confirmarRecebimento(id: number, itens: IAdminItemRecebido[], observacao: string) {
    const doacao = doacaoAprovada(id);
    validarItens(itens);

    const itensHistorico = darEntrada(itens);
    registrarNoHistorico(doacao, itensHistorico);

    doacao.status = "recebido";
    doacao.observacao = observacao.trim() || undefined;

    // Para a tela avisar quais lotes internos foram usados
    return itensHistorico.map(i => ({ nome: i.nome, lote: i.lote, novo: i.novo }));
}

// Quem doou no balcão: um doador cadastrado ou os dados anotados na hora
export type IDoadorDoBalcao = { doadorId: number } | { naoCadastrado: IAdminDoadorNaoCadastrado };

// Doação sem agendamento (Atendimento): cria o agendamento na hora, já como recebido,
// para o histórico e o banco funcionarem igual às doações agendadas.
export async function registrarDoacaoSemAgendamento(doador: IDoadorDoBalcao, itens: IAdminItemRecebido[], observacao: string) {
    let doadorDaDoacao: Pick<IAdminSolicitacaoDoacao, "doadorId" | "doadorNaoCadastrado">;
    if ("doadorId" in doador) {
        doadorPorId(doador.doadorId); // confere se existe
        doadorDaDoacao = { doadorId: doador.doadorId };
    } else {
        const nome = doador.naoCadastrado.nome.trim();
        if (!nome) throw new Error("Informe o nome de quem está doando.");
        if (!documentoValido(doador.naoCadastrado.documento)) throw new Error("Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.");
        doadorDaDoacao = {
            doadorNaoCadastrado: {
                nome,
                documento: formatarDocumento(doador.naoCadastrado.documento),
                telefone: doador.naoCadastrado.telefone?.trim() || undefined,
            },
        };
    }
    validarItens(itens);

    const hoje = getTodayDate();
    const id = Math.max(0, ...mockSolicitacoesDoacao.map(s => s.id), ...mockHistoricoDoacoes.map(h => h.id)) + 1;
    const doacao: IAdminSolicitacaoDoacao = {
        id,
        codigoAgendamento: `AG-${hoje.slice(0, 4)}-${String(id).padStart(3, "0")}`,
        ...doadorDaDoacao,
        semAgendamento: true,
        codigoProduto: itens[0].codigoProduto,
        quantidade: itens[0].quantidade,
        dataProposta: hoje,
        status: "recebido",
        observacao: observacao.trim() || undefined,
    };

    const itensHistorico = darEntrada(itens);
    registrarNoHistorico(doacao, itensHistorico);
    mockSolicitacoesDoacao.push(doacao);

    return {
        codigoAgendamento: doacao.codigoAgendamento,
        lotes: itensHistorico.map(i => ({ nome: i.nome, lote: i.lote, novo: i.novo })),
    };
}

// Recebimento: recusa exige motivo
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
