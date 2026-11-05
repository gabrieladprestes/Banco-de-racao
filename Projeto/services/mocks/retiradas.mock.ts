import { IAdminHistoricoItem, IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminSolicitacaoRetirada } from "../../interfaces/adminSolicitacao.interface";
import { dataNoMesAtual, dataRelativa } from "../../utils/dateUtils";
import { donatarioPorId } from "./donatarios.mock";
import { produtoPorCodigo } from "./produtos.mock";
import { loteFabricanteDe } from "./estoque.mock";

// [código do produto, lote, quantidade]
type ItemCurto = [string, string, number];

function item([codigo, lote, quantidade]: ItemCurto): IAdminHistoricoItem {
    const produto = produtoPorCodigo(codigo);
    return { codigo, nome: produto?.nome ?? codigo, tipo: produto?.tipo ?? "", lote, loteFabricante: loteFabricanteDe(lote), quantidade };
}

function retirada(id: number, donatarioId: number, itens: ItemCurto[], dataRetirada: string, responsavel: string): IAdminHistoricoRetirada {
    const d = donatarioPorId(donatarioId);
    return {
        id,
        codigoAgendamento: `RET-2026-${String(id).padStart(3, "0")}`,
        donatario: d.nome,
        cpf: d.cpf,
        itens: itens.map(item),
        dataRetirada,
        responsavel,
    };
}

// Histórico: retiradas já entregues
export const mockRetiradas: IAdminHistoricoRetirada[] = [
    retirada(1,  4,  [["RC001", "L001", 5]],                       dataRelativa(-180), "Ana Paula"),
    retirada(2,  5,  [["RG001", "L004", 3]],                       dataRelativa(-170), "João Carlos"),
    retirada(3,  6,  [["RC001", "L001", 8], ["RG001", "L004", 2]], dataRelativa(-155), "Ana Paula"),
    retirada(4,  7,  [["RC001", "L002", 10]],                      dataRelativa(-140), "João Carlos"),
    retirada(5,  8,  [["RG001", "L005", 5]],                       dataRelativa(-125), "Ana Paula"),
    retirada(6,  9,  [["RC001", "L002", 6], ["RG001", "L004", 4]], dataRelativa(-110), "João Carlos"),
    retirada(7,  10, [["RC001", "L003", 4]],                       dataRelativa(-95),  "Ana Paula"),
    retirada(8,  11, [["RG001", "L005", 7]],                       dataRelativa(-80),  "João Carlos"),
    retirada(9,  4,  [["RC001", "L001", 5], ["PC001", "P001", 2]], dataRelativa(-70),  "Ana Paula"),
    retirada(10, 13, [["RC001", "L002", 9]],                       dataRelativa(-60),  "João Carlos"),
    retirada(11, 12, [["RG001", "L004", 3], ["PG001", "P002", 2]], dataRelativa(-50),  "Ana Paula"),
    retirada(12, 7,  [["AP001", "M003", 1]],                       dataRelativa(-40),  "João Carlos"),
    // Sempre no mês atual, para a tela de Atendimento ter retiradas do mês para mostrar
    retirada(13, 1,  [["RC001", "L001", 4]],                       dataNoMesAtual(2),  "Ana Paula"),
    retirada(14, 4,  [["RC001", "L001", 3]],                       dataNoMesAtual(5),  "João Carlos"),
];

function solicitacao(
    id: number,
    donatarioId: number,
    itens: [string, number][],
    dataSolicitacao: string,
    dataAgendada: string,
    status: IAdminSolicitacaoRetirada["status"],
): IAdminSolicitacaoRetirada {
    return {
        id,
        codigoAgendamento: `RET-2026-${String(id).padStart(3, "0")}`,
        donatarioId,
        itens: itens.map(([codigoProduto, quantidade]) => ({ codigoProduto, quantidade })),
        dataSolicitacao,
        dataAgendada,
        status,
    };
}

// Pedidos de retirada ainda não entregues
export const mockSolicitacoesRetirada: IAdminSolicitacaoRetirada[] = [
    // Aguardando análise (Gerenciar Agendas)
    solicitacao(15, 1,  [["RC001", 5], ["RG001", 2]], dataRelativa(-1), dataRelativa(3), "pendente"),
    solicitacao(16, 5,  [["RG001", 3]],               dataRelativa(-1), dataRelativa(4), "pendente"),
    solicitacao(17, 7,  [["RC001", 8]],               dataRelativa(-2), dataRelativa(5), "pendente"),
    solicitacao(18, 12, [["RC001", 4], ["RG001", 2]], dataRelativa(0),  dataRelativa(6), "pendente"),
    solicitacao(19, 2,  [["RC001", 15]],              dataRelativa(-6), dataRelativa(2), "recusado"),
    // Aprovadas: aparecem no Calendário, na Saída de Doação e na Agenda do Dashboard.
    // Algumas já passaram da data (atrasadas) e outras são dos próximos dias.
    solicitacao(20, 4,  [["RC001", 3]],               dataRelativa(-12), dataRelativa(-3), "aprovado"),
    solicitacao(21, 6,  [["RC001", 3], ["RG001", 2]], dataRelativa(-10), dataRelativa(-1), "aprovado"),
    solicitacao(22, 8,  [["RG001", 3]],               dataRelativa(-8),  dataRelativa(0),  "aprovado"),
    solicitacao(23, 9,  [["RC001", 4], ["RG001", 2]], dataRelativa(-7),  dataRelativa(1),  "aprovado"),
    solicitacao(24, 10, [["RC001", 3]],               dataRelativa(-6),  dataRelativa(2),  "aprovado"),
    solicitacao(25, 11, [["RG001", 3]],               dataRelativa(-5),  dataRelativa(4),  "aprovado"),
    solicitacao(26, 13, [["RC001", 10]],              dataRelativa(-3),  dataRelativa(9),  "aprovado"),
];
