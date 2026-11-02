export interface IAdminSaidaItem {
    codigoProduto: string;
    item: string;
    quantidadeSolicitada: number;
    quantidadeEntregue: number;
}

export interface IAdminSaidaDoacao {
    id: number;
    codigoAgendamento: string;
    nomeDonatario: string;
    cpf: string;
    telefone: string;
    itens: IAdminSaidaItem[];
    dataAgendada: string;
    status: 'aguardando' | 'entregue' | 'cancelado';
}
