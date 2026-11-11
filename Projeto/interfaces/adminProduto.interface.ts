export interface IAdminProduto {
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    unidade: string;
    descricao: string;
    ativo: boolean;   // inativo: não aparece no recebimento, mas continua no estoque e no histórico
}
