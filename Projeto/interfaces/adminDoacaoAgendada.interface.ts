export interface IAdminDoacaoAgendada {
    id: number;
    codigoAgendamento: string;
    nomeDoador: string;
    cpfCnpj: string;
    telefone: string;
    codigoProduto: string;
    item: string;
    quantidade: number;
    unidade: string;          // kg ou un, do cadastro do produto
    dataAgendada: string;
    status: 'agendado' | 'recebido' | 'recusado';
}
