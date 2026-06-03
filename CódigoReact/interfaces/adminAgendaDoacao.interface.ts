export interface IAdminAgendaDoacao {
    id: number;
    doador: string;
    cpfCnpj: string;
    telefone: string;
    item: string;
    quantidade: number;
    dataProposta: string;
    status: 'pendente' | 'aprovado' | 'recusado';
}
