export interface IAdminHistoricoDoacao {
    id: number;
    tipo: string;
    quantidade: number;
    data: string;
}

export interface IAdminDoador {
    id: number;
    nome: string;
    cpfCnpj: string;
    telefone: string;
    endereco: string;
    foto?: string;
    historicoDoacoes: IAdminHistoricoDoacao[];
}
