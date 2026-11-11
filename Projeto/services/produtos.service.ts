import { IAdminProduto } from "../interfaces/adminProduto.interface";
import { mockProdutos } from "./mocks/produtos.mock";
import { mockEstoque } from "./mocks/estoque.mock";
import { incluirNoEstoque } from "./estoque.service";

// As funções abaixo leem e alteram os mocks (só na memória: voltam ao original com F5).
// Quando a API existir, basta trocar o corpo por um fetch.

// Campos do formulário (o id é gerado e o produto nasce ativo)
export type IAdminProdutoForm = Omit<IAdminProduto, "id" | "ativo">;

export async function buscarProdutos(): Promise<IAdminProduto[]> {
    // Devolve uma cópia, para a tela não alterar os dados sem passar pelo service
    return structuredClone(mockProdutos);
}

// Prefixo do código sugerido por tipo: Ração R001, Medicamento M001, Petisco P001, Outros O001
const PREFIXO_CODIGO: Record<string, string> = { "Ração": "R", "Medicamento": "M", "Petisco": "P", "Outros": "O" };

// Próximo código livre do tipo (ex.: R001, R002...). Os códigos antigos (RC001...) não entram na conta.
export function sugerirCodigo(tipo: string) {
    const prefixo = PREFIXO_CODIGO[tipo];
    if (!prefixo) return "";
    const padrao = new RegExp(`^${prefixo}(\\d{3})$`);
    const numeros = mockProdutos.map(p => p.codigo.match(padrao)?.[1]).filter(Boolean).map(Number);
    return `${prefixo}${String(Math.max(0, ...numeros) + 1).padStart(3, "0")}`;
}

// Saldo em estoque do produto (todos os lotes). Com saldo, a unidade não pode mudar.
export function saldoDoProduto(codigo: string) {
    return (mockEstoque.find(e => e.codigo === codigo)?.lotes ?? []).reduce((acc, l) => acc + l.saldoEstoque, 0);
}

const normalizar = (texto: string) => texto.trim().toLowerCase();

// Validações comuns ao cadastro e à edição
function validar(dados: IAdminProdutoForm, idAtual?: number) {
    const nome = dados.nome.trim();
    if (!nome || !dados.tipo) throw new Error("Preencha nome e tipo.");
    if (!["kg", "un"].includes(dados.unidade)) throw new Error("A unidade deve ser kg ou un.");
    if (mockProdutos.some(p => p.id !== idAtual && normalizar(p.nome) === normalizar(nome) && p.tipo === dados.tipo)) {
        throw new Error(`Já existe "${nome}" no tipo ${dados.tipo}.`);
    }
}

function produtoPorId(id: number) {
    const produto = mockProdutos.find(p => p.id === id);
    if (!produto) throw new Error("Produto não encontrado. Atualize a página.");
    return produto;
}

// Cadastro: grava o produto e já o coloca no estoque (com saldo zero),
// para aparecer na Consulta de Estoque e no Recebimento.
export async function cadastrarProduto(dados: IAdminProdutoForm): Promise<IAdminProduto> {
    const codigo = dados.codigo.trim().toUpperCase();
    if (!codigo) throw new Error("Preencha o código.");
    if (!/^[A-Z0-9-]{2,12}$/.test(codigo)) throw new Error("O código deve ter de 2 a 12 letras ou números (ex.: R001).");
    if (mockProdutos.some(p => p.codigo === codigo)) throw new Error(`Já existe um produto com o código ${codigo}.`);
    validar(dados);

    const produto: IAdminProduto = {
        ...dados,
        id: Math.max(0, ...mockProdutos.map(p => p.id)) + 1,
        codigo,
        nome: dados.nome.trim(),
        descricao: dados.descricao.trim(),
        ativo: true,
    };
    mockProdutos.push(produto);
    incluirNoEstoque(codigo);
    return structuredClone(produto);
}

// Edição: o código não muda (está nos lotes e no histórico).
// A unidade só muda se o produto não tiver saldo, para os números do estoque não mudarem de sentido.
export async function atualizarProduto(id: number, dados: IAdminProdutoForm): Promise<IAdminProduto> {
    const produto = produtoPorId(id);
    validar(dados, id);
    if (dados.unidade !== produto.unidade && saldoDoProduto(produto.codigo) > 0) {
        throw new Error(`${produto.nome} tem saldo em estoque: a unidade não pode mudar.`);
    }
    produto.nome = dados.nome.trim();
    produto.tipo = dados.tipo;
    produto.unidade = dados.unidade;
    produto.descricao = dados.descricao.trim();

    // O estoque guarda nome, tipo e unidade para as telas: mantém igual ao cadastro
    const item = mockEstoque.find(e => e.codigo === produto.codigo);
    if (item) {
        item.nome = produto.nome;
        item.tipo = produto.tipo;
        item.unidade = produto.unidade;
    }
    return structuredClone(produto);
}

// Desativar não apaga: o produto sai do recebimento, mas fica no estoque e no histórico
export async function alterarSituacaoProduto(id: number, ativo: boolean): Promise<IAdminProduto> {
    const produto = produtoPorId(id);
    produto.ativo = ativo;
    return structuredClone(produto);
}
