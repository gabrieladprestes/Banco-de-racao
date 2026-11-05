import { mockEstoque } from "./mocks/estoque.mock";
import { mockProdutos, produtoPorCodigo } from "./mocks/produtos.mock";
import { mockSolicitacoesRetirada } from "./mocks/retiradas.mock";
import { mockSolicitacoesDoacao } from "./mocks/doacoes.mock";
import { donatarioPorId } from "./mocks/donatarios.mock";
import { doadorPorId } from "./mocks/doadores.mock";
import { disponivelProduto } from "./estoque.service";
import { dataRelativa, getTodayDate } from "../utils/dateUtils";
import { statusValidade } from "../utils/estoqueUtils";

// Lê os mesmos mocks das outras telas, então reflete o que foi feito na sessão.
// Quando a API existir, este resumo pode vir pronto de um endpoint só.

export interface IAdminAlertaMinimo {
    nome: string;
    disponivel: number;
    minimo: number;
    unidade: string;
}

export interface IAdminCompromisso {
    chave: string;
    data: string;
    tipo: "Retirada" | "Doação";
    codigo: string;
    nome: string;
    itens: string;
    href: string;
    atrasado: boolean;
}

export interface IAdminResumoDashboard {
    disponivelKg: number;
    disponivelUn: number;
    produtosComSaldo: number;
    lotesVencendo: number;
    lotesVencidosComSaldo: number;
    saldoVencido: number;
    abaixoMinimo: IAdminAlertaMinimo[];
    retiradasPendentes: number;
    doacoesAReceber: number;
    agenda: IAdminCompromisso[];
}

const nomeProduto = (codigo: string) => produtoPorCodigo(codigo)?.nome ?? codigo;

export async function buscarResumoDashboard(): Promise<IAdminResumoDashboard> {
    const hoje = getTodayDate();
    const daquiSeteDias = dataRelativa(7);

    // Estoque disponível, separado por unidade de medida
    let disponivelKg = 0;
    let disponivelUn = 0;
    let produtosComSaldo = 0;
    const abaixoMinimo: IAdminAlertaMinimo[] = [];
    for (const produto of mockProdutos) {
        const disponivel = disponivelProduto(produto.codigo);
        if (produto.unidade === "kg") disponivelKg += disponivel;
        else disponivelUn += disponivel;
        if (disponivel > 0) produtosComSaldo++;
        if (disponivel < produto.estoqueMinimo) {
            abaixoMinimo.push({ nome: produto.nome, disponivel, minimo: produto.estoqueMinimo, unidade: produto.unidade });
        }
    }

    // Validade dos lotes que ainda têm saldo
    const lotes = mockEstoque.flatMap(e => e.lotes).filter(l => l.saldoEstoque > 0);
    const vencidos = lotes.filter(l => statusValidade(l.validade) === "vencido");

    // Agenda: retiradas e doações aprovadas, atrasadas ou dos próximos 7 dias
    const retiradas: IAdminCompromisso[] = mockSolicitacoesRetirada
        .filter(s => s.status === "aprovado" && s.dataAgendada <= daquiSeteDias)
        .map(s => ({
            chave: `r-${s.id}`,
            data: s.dataAgendada,
            tipo: "Retirada",
            codigo: s.codigoAgendamento,
            nome: donatarioPorId(s.donatarioId).nome,
            itens: s.itens.map(i => `${nomeProduto(i.codigoProduto)} (${i.quantidade})`).join(", "),
            href: "/Admin/RetiradaDoacao",
            atrasado: s.dataAgendada < hoje,
        }));
    const doacoes: IAdminCompromisso[] = mockSolicitacoesDoacao
        .filter(s => s.status === "aprovado" && s.dataProposta <= daquiSeteDias)
        .map(s => ({
            chave: `d-${s.id}`,
            data: s.dataProposta,
            tipo: "Doação",
            codigo: s.codigoAgendamento,
            nome: doadorPorId(s.doadorId).nome,
            itens: `${nomeProduto(s.codigoProduto)} (${s.quantidade})`,
            href: "/Admin/ReceberDoacao",
            atrasado: s.dataProposta < hoje,
        }));

    return {
        disponivelKg,
        disponivelUn,
        produtosComSaldo,
        lotesVencendo: lotes.filter(l => statusValidade(l.validade) === "vencendo").length,
        lotesVencidosComSaldo: vencidos.length,
        saldoVencido: vencidos.reduce((acc, l) => acc + l.saldoEstoque, 0),
        abaixoMinimo,
        retiradasPendentes: mockSolicitacoesRetirada.filter(s => s.status === "pendente").length,
        doacoesAReceber: mockSolicitacoesDoacao.filter(s => s.status === "aprovado").length,
        agenda: [...retiradas, ...doacoes].sort((a, b) => a.data.localeCompare(b.data)),
    };
}
