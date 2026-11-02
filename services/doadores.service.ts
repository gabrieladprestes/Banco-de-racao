import { IAdminDoador } from "../interfaces/adminDoador.interface";
import { mockDoadores } from "./mocks/doadores.mock";
import { mockHistoricoDoacoes } from "./mocks/doacoes.mock";

// As funções abaixo leem dos mocks. Quando a API existir, basta trocar o corpo por um fetch.

// Cadastro do doador + histórico montado a partir das doações recebidas
export async function listarDoadores(): Promise<IAdminDoador[]> {
    return mockDoadores.map(d => ({
        ...d,
        historicoDoacoes: mockHistoricoDoacoes
            .filter(h => h.cpfCnpj === d.cpfCnpj)
            .flatMap(h => h.itens.map((item, i) => ({
                id: h.id * 100 + i,
                tipo: item.nome,
                quantidade: item.quantidade,
                data: h.dataRecebimento,
            }))),
    }));
}
