export interface IAdminEstoqueLote {
    lote: string;             // lote interno, gerado pelo sistema
    loteFabricante?: string;  // lote impresso na embalagem (opcional)
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
