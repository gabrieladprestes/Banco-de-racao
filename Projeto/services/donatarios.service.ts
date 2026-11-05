import { IAdminDonatario } from "../interfaces/adminDonatario.interface";
import { mockDonatarios } from "./mocks/donatarios.mock";
import { somenteDigitos } from "../utils/textoUtils";

// As funções abaixo leem dos mocks. Quando a API existir, basta trocar o corpo por um fetch.

export async function listarDonatarios(): Promise<IAdminDonatario[]> {
    return mockDonatarios;
}

// Busca por parte do nome ou do CPF (com ou sem pontuação)
export async function buscarDonatarios(termo: string): Promise<IAdminDonatario[]> {
    const nome = termo.trim().toLowerCase();
    const cpf = somenteDigitos(termo);
    if (!nome) return [];
    return mockDonatarios.filter(d =>
        d.nome.toLowerCase().includes(nome) ||
        (cpf.length > 0 && somenteDigitos(d.cpf).includes(cpf))
    );
}
