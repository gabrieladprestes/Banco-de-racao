import { IAdminProduto } from "../../interfaces/adminProduto.interface";

export const mockProdutos: IAdminProduto[] = [
    { id: 1, codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       unidade: "kg", descricao: "Ração seca para cães adultos", ativo: true },
    { id: 2, codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       unidade: "kg", descricao: "Ração seca para gatos adultos", ativo: true },
    { id: 3, codigo: "VC001", nome: "Vermífugo Cães",    tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para cães", ativo: true },
    { id: 4, codigo: "VG001", nome: "Vermífugo Gatos",   tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para gatos", ativo: true },
    { id: 5, codigo: "AP001", nome: "Antipulgas",        tipo: "Medicamento", unidade: "un", descricao: "Antipulgas e carrapatos", ativo: true },
    { id: 6, codigo: "PC001", nome: "Petisco Cachorro",  tipo: "Petisco",     unidade: "kg", descricao: "Petisco salgado para cães", ativo: true },
    { id: 7, codigo: "PG001", nome: "Petisco Gato",      tipo: "Petisco",     unidade: "kg", descricao: "Petisco para gatos", ativo: true },
];

export function produtoPorCodigo(codigo: string) {
    return mockProdutos.find(p => p.codigo === codigo);
}
