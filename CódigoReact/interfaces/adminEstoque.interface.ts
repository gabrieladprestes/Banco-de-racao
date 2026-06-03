export interface IAdminEstoqueLote {
    lote: string;
    saldoEstoque: number;
    saldoReservado: number;
    validade: string;
}

export interface IAdminEstoque {
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    lotes: IAdminEstoqueLote[];
}
