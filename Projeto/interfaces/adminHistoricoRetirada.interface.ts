export interface IAdminHistoricoItem {
    codigo: string;
    nome: string;
    tipo: string;
    lote: string;
    loteFabricante?: string;
    quantidade: number;
    unidade: string;          // kg ou un, do cadastro do produto
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
