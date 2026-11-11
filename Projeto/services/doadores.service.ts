import { IAdminDoador } from "../interfaces/adminDoador.interface";
import { IAdminDoadorCadastro } from "../interfaces/adminSolicitacao.interface";
import { somenteDigitos } from "../utils/textoUtils";
import { mockDoadores } from "./mocks/doadores.mock";
import { mockHistoricoDoacoes } from "./mocks/doacoes.mock";
import { apiGet, dataDoBanco, usarServidor } from "./api";

// listarDoadores busca no servidor quando ele está configurado (ver services/api.ts);
// sem servidor, usa os mocks.

// Formato que o servidor devolve em GET /admin/doadores (nomes do banco)
interface IDoadorBanco {
    Id_usuario: number;
    Nome: string | null;
    Telefone: string | null;
    CEP: string | null;
    CPF: string | null;
    CNPJ: string | null;
    Doacoes: {
        Id_agendamento: number;
        Id_lote_produto: number;
        Data_agendada: string | null;
        Produto: string | null;
        Peso: string | null;
        Categoria: string | null;
        Quantidade: number | null;
    }[];
}

function doBanco(d: IDoadorBanco): IAdminDoador {
    return {
        id: Number(d.Id_usuario),
        nome: d.Nome ?? "(sem nome)",
        cpfCnpj: d.CNPJ ?? d.CPF ?? "",
        telefone: d.Telefone ?? "",
        endereco: d.CEP ? `CEP ${d.CEP}` : "Não informado",
        historicoDoacoes: d.Doacoes.map(doacao => ({
            // um agendamento pode ter vários lotes: a chave junta os dois
            id: Number(doacao.Id_agendamento) * 100000 + Number(doacao.Id_lote_produto),
            // ex.: "Ração Média 280g (Ração úmida)"
            tipo: [doacao.Produto, doacao.Peso].filter(Boolean).join(" ") + (doacao.Categoria ? ` (${doacao.Categoria})` : ""),
            // o banco conta unidades/sacos do produto, não kg
            quantidade: Number(doacao.Quantidade ?? 0),
            data: dataDoBanco(doacao.Data_agendada),
        })),
    };
}

// Cadastro do doador + histórico de doações
export async function listarDoadores(): Promise<IAdminDoador[]> {
    if (!usarServidor) {
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
    const dados = await apiGet<IDoadorBanco[]>("/admin/doadores");
    return dados.map(doBanco);
}

// Atendimento: busca por parte do nome ou do CPF/CNPJ (com ou sem pontuação).
// Ainda nos mocks, como a busca de donatários: as doações agendadas também estão nos mocks.
export async function buscarDoadores(termo: string): Promise<IAdminDoadorCadastro[]> {
    const nome = termo.trim().toLowerCase();
    const documento = somenteDigitos(termo);
    if (!nome) return [];
    return mockDoadores.filter(d =>
        d.nome.toLowerCase().includes(nome) ||
        (documento.length > 0 && somenteDigitos(d.cpfCnpj).includes(documento))
    );
}
