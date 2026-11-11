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
    unidade: string;          // "kg" ou "un", vem do cadastro de produtos
    lotes: IAdminEstoqueLote[];
}
