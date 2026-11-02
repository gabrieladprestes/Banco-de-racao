import { IAdminDoadorCadastro } from "../../interfaces/adminSolicitacao.interface";

export const mockDoadores: IAdminDoadorCadastro[] = [
    { id: 1,  nome: "João Pereira",                cpfCnpj: "987.654.321-00",     telefone: "(15) 98888-0002", endereco: "Av. Brasil, 456 — Votorantim/SP" },
    { id: 2,  nome: "Empresa Ração Certa Ltda",    cpfCnpj: "12.345.678/0001-99", telefone: "(15) 3333-0001",  endereco: "Rua Industrial, 100 — Votorantim/SP" },
    { id: 3,  nome: "Maria Oliveira",              cpfCnpj: "321.654.987-00",     telefone: "(15) 97777-0013", endereco: "Rua das Palmeiras, 321 — Votorantim/SP" },
    { id: 4,  nome: "Carlos Mendes",               cpfCnpj: "222.333.444-55",     telefone: "(15) 99111-2233", endereco: "Rua José Ermírio, 77 — Votorantim/SP" },
    { id: 5,  nome: "PetShop Amigo Fiel Ltda",     cpfCnpj: "98.765.432/0001-10", telefone: "(15) 3210-5500",  endereco: "Av. Juscelino K. de Oliveira, 1500 — Votorantim/SP" },
    { id: 6,  nome: "Ana Paula Santos",            cpfCnpj: "333.444.555-66",     telefone: "(15) 98765-4321", endereco: "Rua Goiás, 64 — Votorantim/SP" },
    { id: 7,  nome: "Supermercado Bom Preço Ltda", cpfCnpj: "11.222.333/0001-44", telefone: "(15) 3344-5566",  endereco: "Av. Liberdade, 2000 — Votorantim/SP" },
    { id: 8,  nome: "Roberto Alves",               cpfCnpj: "444.555.666-77",     telefone: "(15) 97654-3210", endereco: "Rua Pernambuco, 19 — Votorantim/SP" },
    { id: 9,  nome: "Fernanda Costa",              cpfCnpj: "555.666.777-88",     telefone: "(15) 99887-6655", endereco: "Rua Ceará, 230 — Votorantim/SP" },
    { id: 10, nome: "Distribuidora AnimalVida SA", cpfCnpj: "55.444.333/0001-22", telefone: "(15) 3456-7890",  endereco: "Rod. Raposo Tavares, km 98 — Votorantim/SP" },
    { id: 11, nome: "Carla Souza",                 cpfCnpj: "666.777.888-99",     telefone: "(15) 96666-0004", endereco: "Rua das Hortênsias, 12 — Votorantim/SP" },
];

export function doadorPorId(id: number) {
    const doador = mockDoadores.find(d => d.id === id);
    if (!doador) throw new Error(`Doador ${id} não existe nos mocks`);
    return doador;
}
