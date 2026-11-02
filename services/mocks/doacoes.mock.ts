import { IAdminHistoricoDoacao } from "../../interfaces/adminHistoricoDoacao.interface";
import { IAdminHistoricoItem } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminSolicitacaoDoacao } from "../../interfaces/adminSolicitacao.interface";
import { dataRelativa } from "../../utils/dateUtils";
import { doadorPorId } from "./doadores.mock";
import { produtoPorCodigo } from "./produtos.mock";
import { loteFabricanteDe } from "./estoque.mock";

// [código do produto, lote, quantidade]
type ItemCurto = [string, string, number];

function item([codigo, lote, quantidade]: ItemCurto): IAdminHistoricoItem {
    const produto = produtoPorCodigo(codigo);
    return { codigo, nome: produto?.nome ?? codigo, tipo: produto?.tipo ?? "", lote, loteFabricante: loteFabricanteDe(lote), quantidade };
}

function recebida(id: number, doadorId: number, itens: ItemCurto[], dataRecebimento: string, responsavel: string): IAdminHistoricoDoacao {
    const d = doadorPorId(doadorId);
    return {
        id,
        codigoAgendamento: `AG-2026-${String(id).padStart(3, "0")}`,
        doador: d.nome,
        cpfCnpj: d.cpfCnpj,
        itens: itens.map(item),
        dataRecebimento,
        responsavel,
    };
}

// Histórico: doações já recebidas
export const mockHistoricoDoacoes: IAdminHistoricoDoacao[] = [
    recebida(1,  1,  [["RC001", "L001", 10]],                        dataRelativa(-190), "Ana Paula"),
    recebida(2,  2,  [["RG001", "L004", 20]],                        dataRelativa(-175), "João Carlos"),
    recebida(3,  3,  [["RC001", "L001", 5]],                         dataRelativa(-160), "Ana Paula"),
    recebida(4,  4,  [["RG001", "L005", 8]],                         dataRelativa(-150), "João Carlos"),
    recebida(5,  5,  [["RC001", "L002", 50]],                        dataRelativa(-135), "Ana Paula"),
    recebida(6,  6,  [["RG001", "L004", 12]],                        dataRelativa(-120), "João Carlos"),
    recebida(7,  7,  [["RC001", "L002", 30], ["PC001", "P001", 8]],  dataRelativa(-100), "Ana Paula"),
    recebida(8,  8,  [["RG001", "L005", 6]],                         dataRelativa(-85),  "João Carlos"),
    recebida(9,  9,  [["RC001", "L003", 15]],                        dataRelativa(-60),  "Ana Paula"),
    recebida(10, 10, [["RG001", "L004", 40], ["PC001", "P001", 7]],  dataRelativa(-45),  "João Carlos"),
];

function proposta(
    id: number,
    doadorId: number,
    codigoProduto: string,
    quantidade: number,
    dataProposta: string,
    status: IAdminSolicitacaoDoacao["status"],
): IAdminSolicitacaoDoacao {
    return { id, codigoAgendamento: `AG-2026-${String(id).padStart(3, "0")}`, doadorId, codigoProduto, quantidade, dataProposta, status };
}

// Propostas de doação ainda não recebidas
export const mockSolicitacoesDoacao: IAdminSolicitacaoDoacao[] = [
    // Aguardando análise (Gerenciar Agendas)
    proposta(11, 1,  "RC001", 10, dataRelativa(2), "pendente"),
    proposta(12, 2,  "RG001", 20, dataRelativa(3), "pendente"),
    proposta(13, 7,  "RG001", 30, dataRelativa(7), "pendente"),
    proposta(14, 8,  "RG001", 6,  dataRelativa(1), "recusado"),
    // Aprovadas: aparecem no Calendário, em Receber Doação e na Agenda do Dashboard
    proposta(15, 3,  "RC001", 5,  dataRelativa(-2), "aprovado"),
    proposta(16, 4,  "RG001", 8,  dataRelativa(0),  "aprovado"),
    proposta(17, 5,  "RC001", 50, dataRelativa(1),  "aprovado"),
    proposta(18, 6,  "RG001", 12, dataRelativa(3),  "aprovado"),
    proposta(19, 9,  "RC001", 15, dataRelativa(5),  "aprovado"),
    proposta(20, 10, "RG001", 40, dataRelativa(12), "aprovado"),
];
