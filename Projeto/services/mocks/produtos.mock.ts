import { IAdminProduto } from "../../interfaces/adminProduto.interface";

export const mockProdutos: IAdminProduto[] = [
    { id: 1, codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       unidade: "kg", descricao: "Ração seca para cães adultos",  estoqueMinimo: 20 },
    { id: 2, codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       unidade: "kg", descricao: "Ração seca para gatos adultos", estoqueMinimo: 15 },
    { id: 3, codigo: "VC001", nome: "Vermífugo Cães",    tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para cães",       estoqueMinimo: 10 },
    { id: 4, codigo: "VG001", nome: "Vermífugo Gatos",   tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para gatos",      estoqueMinimo: 10 },
    { id: 5, codigo: "AP001", nome: "Antipulgas",        tipo: "Medicamento", unidade: "un", descricao: "Antipulgas e carrapatos",        estoqueMinimo: 8  },
    { id: 6, codigo: "PC001", nome: "Petisco Cachorro",  tipo: "Petisco",     unidade: "kg", descricao: "Petisco salgado para cães",      estoqueMinimo: 5  },
    { id: 7, codigo: "PG001", nome: "Petisco Gato",      tipo: "Petisco",     unidade: "kg", descricao: "Petisco para gatos",             estoqueMinimo: 5  },
];

export function produtoPorCodigo(codigo: string) {
    return mockProdutos.find(p => p.codigo === codigo);
}
