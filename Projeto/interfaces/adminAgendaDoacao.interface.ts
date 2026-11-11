export interface IAdminAgendaDoacao {
    id: number;
    doador: string;
    cpfCnpj: string;
    telefone: string;
    item: string;
    quantidade: number;
    unidade: string;          // kg ou un, do cadastro do produto
    dataProposta: string;
    status: 'pendente' | 'aprovado' | 'recusado';
    codigoAgendamento?: string;
    observacao?: string;
}
