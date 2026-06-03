export interface IAdminDoacaoAgendada {
    id: number;
    codigoAgendamento: string;
    nomeDoador: string;
    cpfCnpj: string;
    telefone: string;
    item: string;
    quantidade: number;
    dataAgendada: string;
    status: 'agendado' | 'recebido' | 'recusado';
}
