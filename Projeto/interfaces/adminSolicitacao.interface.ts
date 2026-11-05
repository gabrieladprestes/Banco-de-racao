// Formato "cru" dos dados (como viriam da API). Os services convertem
// estes registros para o formato que cada tela usa.

export interface IAdminSolicitacaoItem {
    codigoProduto: string;
    quantidade: number;
}

// Pedido de retirada feito pelo donatário.
// pendente -> aprovado (aparece no Calendário e na Saída) -> entregue (vai para o Histórico)
export interface IAdminSolicitacaoRetirada {
    id: number;
    codigoAgendamento: string;
    donatarioId: number;
    itens: IAdminSolicitacaoItem[];
    dataSolicitacao: string;
    dataAgendada: string;
    status: 'pendente' | 'aprovado' | 'recusado' | 'entregue' | 'cancelado';
    observacao?: string;
}

// Proposta de doação feita pelo doador.
// pendente -> aprovado (aparece no Calendário e em Receber Doação) -> recebido (vai para o Histórico)
export interface IAdminSolicitacaoDoacao {
    id: number;
    codigoAgendamento: string;
    doadorId: number;
    codigoProduto: string;
    quantidade: number;
    dataProposta: string;
    status: 'pendente' | 'aprovado' | 'recusado' | 'recebido';
    observacao?: string;
}

// Item conferido no recebimento de uma doação.
// O lote interno é gerado pelo sistema; o do fabricante é opcional.
export interface IAdminItemRecebido {
    codigoProduto: string;
    loteFabricante: string;
    validade: string;
    quantidade: number;
}

// Quanto sai de cada lote interno na entrega
export interface IAdminLoteEntregue {
    lote: string;
    quantidade: number;
}

// Item conferido na entrega de uma retirada
export interface IAdminItemEntregue {
    codigoProduto: string;
    lotes: IAdminLoteEntregue[];
}

// Cadastro do doador sem o histórico (o histórico vem das doações recebidas)
export interface IAdminDoadorCadastro {
    id: number;
    nome: string;
    cpfCnpj: string;
    telefone: string;
    endereco: string;
}
