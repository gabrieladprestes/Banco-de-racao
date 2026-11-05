import { IAdminDonatario } from "../../interfaces/adminDonatario.interface";

export const mockDonatarios: IAdminDonatario[] = [
    { id: 1,  nome: "Maria Silva",      cpf: "123.456.789-00", telefone: "(15) 99999-0001", endereco: "Rua das Flores, 123 — Votorantim/SP",
      pets: [{ id: 1, nome: "Rex", especie: "Cachorro", porte: "Médio" }, { id: 2, nome: "Mimi", especie: "Gato", porte: "Pequeno" }] },
    { id: 2,  nome: "João Pereira",     cpf: "987.654.321-00", telefone: "(15) 98888-0002", endereco: "Av. Brasil, 456 — Votorantim/SP",
      pets: [{ id: 3, nome: "Bolinha", especie: "Cachorro", porte: "Grande" }] },
    { id: 3,  nome: "Ana Costa",        cpf: "111.222.333-44", telefone: "(15) 97777-0003", endereco: "Rua das Acácias, 789 — Votorantim/SP",
      pets: [] },
    { id: 4,  nome: "Beatriz Lima",     cpf: "123.456.789-01", telefone: "(15) 98765-0001", endereco: "Rua XV de Novembro, 50 — Votorantim/SP",
      pets: [{ id: 4, nome: "Thor", especie: "Cachorro", porte: "Pequeno" }] },
    { id: 5,  nome: "Marcos Souza",     cpf: "234.567.890-12", telefone: "(15) 97654-0002", endereco: "Rua Monsenhor Leopoldo, 210 — Votorantim/SP",
      pets: [{ id: 5, nome: "Nina", especie: "Gato", porte: "Pequeno" }] },
    { id: 6,  nome: "Luciana Ferreira", cpf: "345.678.901-23", telefone: "(15) 98877-0003", endereco: "Rua São João, 88 — Votorantim/SP",
      pets: [{ id: 6, nome: "Pipoca", especie: "Cachorro", porte: "Pequeno" }, { id: 7, nome: "Frajola", especie: "Gato", porte: "Pequeno" }] },
    { id: 7,  nome: "Paulo Henrique",   cpf: "456.789.012-34", telefone: "(15) 96543-0004", endereco: "Av. Dr. Gualberto Moreira, 1200 — Votorantim/SP",
      pets: [{ id: 8, nome: "Max", especie: "Cachorro", porte: "Grande" }] },
    { id: 8,  nome: "Cristina Almeida", cpf: "567.890.123-45", telefone: "(15) 99001-0005", endereco: "Rua Santa Cruz, 47 — Votorantim/SP",
      pets: [{ id: 9, nome: "Luna", especie: "Gato", porte: "Médio" }] },
    { id: 9,  nome: "Diego Nascimento", cpf: "678.901.234-56", telefone: "(15) 98112-0006", endereco: "Rua Pedro Rodrigues, 302 — Votorantim/SP",
      pets: [{ id: 10, nome: "Bob", especie: "Cachorro", porte: "Médio" }, { id: 11, nome: "Salem", especie: "Gato", porte: "Pequeno" }] },
    { id: 10, nome: "Simone Martins",   cpf: "789.012.345-67", telefone: "(15) 97223-0007", endereco: "Rua Vereador Elias, 15 — Votorantim/SP",
      pets: [{ id: 12, nome: "Mel", especie: "Cachorro", porte: "Pequeno" }] },
    { id: 11, nome: "Tadeu Ribeiro",    cpf: "890.123.456-78", telefone: "(15) 98334-0008", endereco: "Rua Itapeva, 560 — Votorantim/SP",
      pets: [{ id: 13, nome: "Tom", especie: "Gato", porte: "Médio" }] },
    { id: 12, nome: "Vanessa Rocha",    cpf: "901.234.567-89", telefone: "(15) 96445-0009", endereco: "Rua Bahia, 71 — Votorantim/SP",
      pets: [{ id: 14, nome: "Toby", especie: "Cachorro", porte: "Médio" }, { id: 15, nome: "Lola", especie: "Gato", porte: "Pequeno" }] },
    { id: 13, nome: "Eduardo Campos",   cpf: "012.345.678-90", telefone: "(15) 99556-0010", endereco: "Av. 31 de Março, 940 — Votorantim/SP",
      pets: [{ id: 16, nome: "Zeus", especie: "Cachorro", porte: "Grande" }] },
];

export function donatarioPorId(id: number) {
    const donatario = mockDonatarios.find(d => d.id === id);
    if (!donatario) throw new Error(`Donatário ${id} não existe nos mocks`);
    return donatario;
}
