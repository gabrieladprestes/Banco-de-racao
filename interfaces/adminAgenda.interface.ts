import { IAdminCotaProduto } from "./adminAtendimento.interface";

export interface IAdminAgendaItem {
    codigoProduto: string;
    item: string;
    quantidade: number;
}

export interface IAdminAgenda {
    id: number;
    codigoAgendamento: string;
    donatario: string;
    cpf: string;
    telefone: string;
    itensSolicitados: IAdminAgendaItem[];
    dataSolicitacao: string;
    dataAgendada: string;
    status: 'pendente' | 'aprovado' | 'recusado';
    observacao?: string;
    // Cota do donatário no mês da data agendada (sem contar este pedido)
    cotas: IAdminCotaProduto[];
}
