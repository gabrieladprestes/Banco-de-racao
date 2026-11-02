import { IAdminProduto } from "../interfaces/adminProduto.interface";
import { mockProdutos } from "./mocks/produtos.mock";

// As funções abaixo leem dos mocks. Quando a API existir, basta trocar o corpo por um fetch.

export async function buscarProdutos(): Promise<IAdminProduto[]> {
    return mockProdutos;
}
