export interface IAdminCotaProduto {
    codigo: string;
    nome: string;
    cotaMensal: number;
    retiradoMes: number;   // já entregue no mês
    aprovadoMes: number;   // aprovado e ainda não entregue no mês
    saldoCota: number;     // cota - retirado - aprovado
    disponivelEstoque: number;
    liberado: number;
}
