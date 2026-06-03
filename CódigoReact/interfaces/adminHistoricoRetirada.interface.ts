export interface IAdminHistoricoItem {
    codigo: string;
    nome: string;
    tipo: string;
    lote: string;
    quantidade: number;
}

export interface IAdminHistoricoRetirada {
    id: number;
    codigoAgendamento: string;
    donatario: string;
    cpf: string;
    itens: IAdminHistoricoItem[];
    dataRetirada: string;
    responsavel: string;
}
