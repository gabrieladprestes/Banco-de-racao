import { EspeciePet, IAdminDonatario, PortePet } from "../interfaces/adminDonatario.interface";
import { mockDonatarios } from "./mocks/donatarios.mock";
import { somenteDigitos } from "../utils/textoUtils";
import { apiGet, usarServidor } from "./api";

// listarDonatarios busca no servidor quando ele está configurado (ver services/api.ts);
// sem servidor, usa os mocks. buscarDonatarios (Atendimento) ainda usa só os mocks,
// porque o Atendimento depende de retiradas e cota, que ainda não estão no banco.

// Formato que o servidor devolve em GET /admin/donatarios (nomes do banco)
interface IDonatarioBanco {
    Id_usuario: number;
    Nome: string | null;
    Telefone: string | null;
    CEP: string | null;
    CPF: string;
    Animais: { Id_animal: number; Nome: string | null; Especie: string | null; Porte: string | null }[];
}

// O banco usa "Canino"/"Felino"; as telas usam "Cachorro"/"Gato"
const ESPECIE: Record<string, EspeciePet> = { Canino: "Cachorro", Felino: "Gato" };
const PORTES: PortePet[] = ["Pequeno", "Médio", "Grande"];

function doBanco(d: IDonatarioBanco): IAdminDonatario {
    return {
        id: Number(d.Id_usuario),
        nome: d.Nome ?? "(sem nome)",
        cpf: d.CPF,
        telefone: d.Telefone ?? "",
        endereco: d.CEP ? `CEP ${d.CEP}` : "Não informado",
        pets: d.Animais
            .filter(a => a.Especie && ESPECIE[a.Especie])
            .map(a => ({
                id: Number(a.Id_animal),
                nome: a.Nome ?? "(sem nome)",
                especie: ESPECIE[a.Especie!],
                // Gato não tem porte no banco; para a cota de gato o porte não muda nada
                porte: PORTES.find(p => p === a.Porte) ?? "Pequeno",
            })),
    };
}

export async function listarDonatarios(): Promise<IAdminDonatario[]> {
    if (!usarServidor) return mockDonatarios;
    const dados = await apiGet<IDonatarioBanco[]>("/admin/donatarios");
    return dados.map(doBanco);
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
