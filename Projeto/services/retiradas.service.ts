import { IAdminAgenda } from "../interfaces/adminAgenda.interface";
import { IAdminAgendamento } from "../interfaces/adminAgendamento.interface";
import { IAdminHistoricoRetirada } from "../interfaces/adminHistoricoRetirada.interface";
import { IAdminSaidaDoacao } from "../interfaces/adminSaidaDoacao.interface";
import { IAdminItemEntregue, IAdminSolicitacaoItem, IAdminSolicitacaoRetirada } from "../interfaces/adminSolicitacao.interface";
import { mockRetiradas, mockSolicitacoesRetirada } from "./mocks/retiradas.mock";
import { donatarioPorId, mockDonatarios } from "./mocks/donatarios.mock";
import { produtoPorCodigo } from "./mocks/produtos.mock";
import { mockEstoque } from "./mocks/estoque.mock";
import { baixaEstoque, disponivelProduto, liberarReserva, reservarEstoque, validarSaida } from "./estoque.service";
import { calcularCotas } from "./atendimento.service";
import { usuarioLogado } from "./sessao";
import { getTodayDate } from "../utils/dateUtils";

// As funções abaixo leem e alteram os mocks (só na memória: voltam ao original com F5).
// Quando a API existir, basta trocar o corpo por um fetch.

const nomeProduto = (codigo: string) => produtoPorCodigo(codigo)?.nome ?? codigo;
const mesDe = (data: string) => data.slice(0, 7);

// ---- Cota ----

// Itens já aprovados (não entregues) do donatário no mês, sem contar um pedido específico
function aprovadosNoMes(donatarioId: number, mes: string, excluirId?: number): IAdminSolicitacaoItem[] {
    return mockSolicitacoesRetirada
        .filter(s => s.status === "aprovado" && s.donatarioId === donatarioId && mesDe(s.dataAgendada) === mes && s.id !== excluirId)
        .flatMap(s => s.itens);
}

function cotasDoPedido(s: IAdminSolicitacaoRetirada) {
    const d = donatarioPorId(s.donatarioId);
    const mes = mesDe(s.dataAgendada);
    const entregues = mockRetiradas.filter(r => r.cpf === d.cpf && mesDe(r.dataRetirada) === mes);
    return calcularCotas(d.pets, entregues, aprovadosNoMes(d.id, mes, s.id), mockEstoque);
}

// ---- Consultas ----

// Gerenciar Agendas: pedidos pendentes, aprovados e recusados, com a cota do donatário
export async function buscarSolicitacoesRetirada(): Promise<IAdminAgenda[]> {
    return mockSolicitacoesRetirada
        .filter(s => s.status === "pendente" || s.status === "aprovado" || s.status === "recusado")
        .map(s => {
            const d = donatarioPorId(s.donatarioId);
            return {
                id: s.id,
                codigoAgendamento: s.codigoAgendamento,
                donatario: d.nome,
                cpf: d.cpf,
                telefone: d.telefone,
                itensSolicitados: s.itens.map(i => ({ codigoProduto: i.codigoProduto, item: nomeProduto(i.codigoProduto), quantidade: i.quantidade })),
                dataSolicitacao: s.dataSolicitacao,
                dataAgendada: s.dataAgendada,
                status: s.status as IAdminAgenda["status"],
                observacao: s.observacao,
                cotas: cotasDoPedido(s),
            };
        });
}

// Calendário: uma linha por item das retiradas aprovadas
export async function buscarRetiradasAgendadas(): Promise<IAdminAgendamento[]> {
    return mockSolicitacoesRetirada
        .filter(s => s.status === "aprovado")
        .flatMap(s => s.itens.map((i, idx) => ({
            id: s.id * 100 + idx,
            donatario: donatarioPorId(s.donatarioId).nome,
            item: nomeProduto(i.codigoProduto),
            quantidade: i.quantidade,
            data: s.dataAgendada,
            status: "Confirmado",
        })));
}

// Saída de Doação: retiradas aprovadas aguardando a entrega
export async function buscarSaidasPendentes(): Promise<IAdminSaidaDoacao[]> {
    return mockSolicitacoesRetirada
        .filter(s => s.status === "aprovado")
        .map(s => {
            const d = donatarioPorId(s.donatarioId);
            return {
                id: s.id,
                codigoAgendamento: s.codigoAgendamento,
                nomeDonatario: d.nome,
                cpf: d.cpf,
                telefone: d.telefone,
                itens: s.itens.map(i => ({
                    codigoProduto: i.codigoProduto,
                    item: nomeProduto(i.codigoProduto),
                    quantidadeSolicitada: i.quantidade,
                    quantidadeEntregue: i.quantidade,
                })),
                dataAgendada: s.dataAgendada,
                status: "aguardando",
            };
        });
}

// Histórico: retiradas já entregues
export async function buscarHistoricoRetiradas(): Promise<IAdminHistoricoRetirada[]> {
    return structuredClone(mockRetiradas);
}

// Atendimento: retiradas entregues ao donatário no mês atual
export async function buscarRetiradasDoMes(cpf: string): Promise<IAdminHistoricoRetirada[]> {
    const mes = mesDe(getTodayDate());
    return structuredClone(mockRetiradas.filter(r => r.cpf === cpf && mesDe(r.dataRetirada) === mes));
}

// Atendimento: itens aprovados (ainda não entregues) para o donatário no mês atual
export async function buscarAprovadosDoMes(cpf: string): Promise<IAdminSolicitacaoItem[]> {
    const donatario = mockDonatarios.find(d => d.cpf === cpf);
    return donatario ? structuredClone(aprovadosNoMes(donatario.id, mesDe(getTodayDate()))) : [];
}

// ---- Gerenciar Agendas ----

function pedido(id: number, statusEsperado: IAdminSolicitacaoRetirada["status"][]) {
    const s = mockSolicitacoesRetirada.find(x => x.id === id);
    if (!s || !statusEsperado.includes(s.status)) throw new Error("Este pedido foi alterado. Atualize a página.");
    return s;
}

// Aprova: grava quantidades e data, e reserva no estoque.
// Bloqueia se faltar estoque; acima da cota só avisa (a tela mostra), quem decide é o funcionário.
export async function aprovarRetirada(id: number, itens: IAdminSolicitacaoItem[], dataAgendada: string, observacao: string) {
    const s = pedido(id, ["pendente"]);
    if (!dataAgendada) throw new Error("Informe a data de retirada.");
    if (dataAgendada < getTodayDate()) throw new Error("A data de retirada não pode estar no passado.");
    if (itens.some(i => !(i.quantidade >= 0))) throw new Error("As quantidades não podem ser negativas.");
    const aprovados = itens.filter(i => i.quantidade > 0);
    if (aprovados.length === 0) throw new Error("Nenhuma quantidade para aprovar. Para não atender o pedido, use Recusar.");
    for (const i of aprovados) {
        const disponivel = disponivelProduto(i.codigoProduto);
        if (i.quantidade > disponivel) {
            throw new Error(`${nomeProduto(i.codigoProduto)}: estoque disponível insuficiente (disponível ${disponivel}).`);
        }
    }

    aprovados.forEach(i => reservarEstoque(i.codigoProduto, i.quantidade));
    s.itens = aprovados.map(i => ({ codigoProduto: i.codigoProduto, quantidade: i.quantidade }));
    s.dataAgendada = dataAgendada;
    s.status = "aprovado";
    s.observacao = observacao.trim() || undefined;
}

// Recusa: exige motivo (fica registrado para auditoria)
export async function recusarRetirada(id: number, motivo: string) {
    const s = pedido(id, ["pendente"]);
    if (!motivo.trim()) throw new Error("Informe o motivo da recusa.");
    s.status = "recusado";
    s.observacao = motivo.trim();
}

// Reabre um pedido aprovado ou recusado. Se estava aprovado, devolve a reserva.
export async function reabrirRetirada(id: number) {
    const s = pedido(id, ["aprovado", "recusado"]);
    if (s.status === "aprovado") s.itens.forEach(i => liberarReserva(i.codigoProduto, i.quantidade));
    s.status = "pendente";
}

// ---- Saída de Doação ----

function retiradaAprovada(id: number) {
    const retirada = mockSolicitacoesRetirada.find(s => s.id === id);
    if (!retirada || retirada.status !== "aprovado") {
        throw new Error("Esta retirada não está mais aguardando entrega.");
    }
    return retirada;
}

// Confere as quantidades, dá baixa no estoque (usando a reserva desta retirada) e registra no histórico
export async function confirmarEntrega(id: number, itens: IAdminItemEntregue[], observacao: string) {
    const retirada = retiradaAprovada(id);
    const reservaDe = (codigo: string) => retirada.itens.find(i => i.codigoProduto === codigo)?.quantidade ?? 0;

    // Valida tudo antes de mexer no estoque, para não dar baixa pela metade
    for (const item of itens) {
        const nome = nomeProduto(item.codigoProduto);
        const solicitado = reservaDe(item.codigoProduto);
        const total = item.lotes.reduce((acc, l) => acc + l.quantidade, 0);
        if (total > solicitado) throw new Error(`${nome}: não é possível entregar mais que o solicitado (${solicitado}).`);
        validarSaida(item.codigoProduto, item.lotes, solicitado);
    }
    const entregues = itens.filter(i => i.lotes.length > 0);
    if (entregues.length === 0) throw new Error("Nenhuma quantidade para entregar. Para não entregar nada, use Cancelar Entrega.");

    const itensHistorico = entregues.flatMap(i => {
        const produto = produtoPorCodigo(i.codigoProduto);
        return baixaEstoque(i.codigoProduto, i.lotes, reservaDe(i.codigoProduto)).map(usado => ({
            codigo: i.codigoProduto,
            nome: produto?.nome ?? i.codigoProduto,
            tipo: produto?.tipo ?? "",
            lote: usado.lote,
            loteFabricante: usado.loteFabricante,
            quantidade: usado.quantidade,
        }));
    });
    // Item que não saiu nada: a reserva dele também é devolvida
    retirada.itens
        .filter(r => !entregues.some(e => e.codigoProduto === r.codigoProduto))
        .forEach(r => liberarReserva(r.codigoProduto, r.quantidade));

    const donatario = donatarioPorId(retirada.donatarioId);
    mockRetiradas.push({
        id: Math.max(0, ...mockRetiradas.map(r => r.id)) + 1,
        codigoAgendamento: retirada.codigoAgendamento,
        donatario: donatario.nome,
        cpf: donatario.cpf,
        itens: itensHistorico,
        dataRetirada: getTodayDate(),
        responsavel: usuarioLogado,
    });

    retirada.status = "entregue";
    retirada.observacao = observacao.trim() || undefined;
}

// Cancela: exige motivo e devolve a reserva
export async function cancelarEntrega(id: number, motivo: string) {
    const retirada = retiradaAprovada(id);
    if (!motivo.trim()) throw new Error("Informe o motivo do cancelamento no campo Observações.");
    retirada.itens.forEach(i => liberarReserva(i.codigoProduto, i.quantidade));
    retirada.status = "cancelado";
    retirada.observacao = motivo.trim();
}
