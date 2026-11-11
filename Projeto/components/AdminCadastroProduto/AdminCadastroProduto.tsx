"use client";
import { useEffect, useState } from "react";
import styles from "./AdminCadastroProduto.module.css";
import { IAdminProduto } from "../../interfaces/adminProduto.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import {
    IAdminProdutoForm,
    alterarSituacaoProduto,
    atualizarProduto,
    buscarProdutos,
    cadastrarProduto,
    sugerirCodigo,
} from "../../services/produtos.service";
import { buscarEstoque } from "../../services/estoque.service";
import { totalEstoque } from "../../utils/estoqueUtils";
import { Pencil, Plus, Power, TriangleAlert, X } from "lucide-react";

const TIPOS = ["Ração", "Medicamento", "Petisco", "Outros"];
const FORM_VAZIO: IAdminProdutoForm = { codigo: "", nome: "", tipo: "", unidade: "kg", descricao: "" };

type FiltroSituacao = "ativos" | "inativos" | "todos";

interface IFiltro {
    busca: string;
    tipo: string;
    situacao: FiltroSituacao;
}
const FILTRO_INICIAL: IFiltro = { busca: "", tipo: "", situacao: "ativos" };

function filtrar(produtos: IAdminProduto[], f: IFiltro) {
    const termo = f.busca.trim().toLowerCase();
    return produtos.filter(p =>
        (!termo || p.nome.toLowerCase().includes(termo) || p.codigo.toLowerCase().includes(termo)) &&
        (!f.tipo || p.tipo === f.tipo) &&
        (f.situacao === "todos" || (f.situacao === "ativos" ? p.ativo : !p.ativo))
    );
}

export const AdminCadastroProduto = () => {
    const [produtos, setProdutos] = useState<IAdminProduto[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState("");

    // Filtros: o que está nos campos e o que foi aplicado no Buscar
    const [campos, setCampos] = useState<IFiltro>(FILTRO_INICIAL);
    const [filtro, setFiltro] = useState<IFiltro>(FILTRO_INICIAL);

    // Modal de cadastro/edição (editando = null: produto novo)
    const [modalAberto, setModalAberto] = useState(false);
    const [editando, setEditando] = useState<IAdminProduto | null>(null);
    const [form, setForm] = useState<IAdminProdutoForm>(FORM_VAZIO);
    const [codigoSugerido, setCodigoSugerido] = useState("");
    const [erro, setErro] = useState("");

    // Confirmação de desativar
    const [paraDesativar, setParaDesativar] = useState<IAdminProduto | null>(null);

    function recarregar() {
        return Promise.all([buscarProdutos(), buscarEstoque()]).then(([p, e]) => {
            setProdutos(p);
            setEstoque(e);
            setCarregando(false);
        });
    }

    useEffect(() => {
        recarregar();
    }, []);

    function avisar(texto: string) {
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 5000);
    }

    const saldo = (codigo: string) => totalEstoque(estoque.find(e => e.codigo === codigo)?.lotes ?? []);

    // ---- Filtros ----
    function buscar() {
        setFiltro(campos);
    }

    function limpar() {
        setCampos(FILTRO_INICIAL);
        setFiltro(FILTRO_INICIAL);
    }

    // ---- Modal ----
    function abrirNovo() {
        setEditando(null);
        setForm(FORM_VAZIO);
        setCodigoSugerido("");
        setErro("");
        setModalAberto(true);
    }

    function abrirEdicao(produto: IAdminProduto) {
        setEditando(produto);
        setForm({ codigo: produto.codigo, nome: produto.nome, tipo: produto.tipo, unidade: produto.unidade, descricao: produto.descricao });
        setErro("");
        setModalAberto(true);
    }

    function alterarForm(campos: Partial<IAdminProdutoForm>) {
        setErro("");
        setForm(f => ({ ...f, ...campos }));
    }

    // No cadastro, o código acompanha o tipo enquanto o usuário não o alterar
    function trocarTipo(tipo: string) {
        if (editando) {
            alterarForm({ tipo });
            return;
        }
        const sugestao = sugerirCodigo(tipo);
        alterarForm({ tipo, codigo: !form.codigo || form.codigo === codigoSugerido ? sugestao : form.codigo });
        setCodigoSugerido(sugestao);
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editando) {
                const p = await atualizarProduto(editando.id, form);
                avisar(`Produto ${p.codigo} — ${p.nome} atualizado.`);
            } else {
                const p = await cadastrarProduto(form);
                avisar(`Produto ${p.codigo} — ${p.nome} cadastrado. Ele já aparece no Recebimento e na Consulta de Estoque.`);
            }
            setModalAberto(false);
            await recarregar();
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    // ---- Situação ----
    async function confirmarDesativar() {
        if (!paraDesativar) return;
        const p = await alterarSituacaoProduto(paraDesativar.id, false);
        setParaDesativar(null);
        avisar(`Produto ${p.codigo} — ${p.nome} desativado. Ele não aparece mais no Recebimento.`);
        await recarregar();
    }

    async function reativar(produto: IAdminProduto) {
        const p = await alterarSituacaoProduto(produto.id, true);
        avisar(`Produto ${p.codigo} — ${p.nome} reativado.`);
        await recarregar();
    }

    const lista = filtrar(produtos, filtro);
    const temFiltro = JSON.stringify(campos) !== JSON.stringify(FILTRO_INICIAL) || JSON.stringify(filtro) !== JSON.stringify(FILTRO_INICIAL);
    const unidadeTravada = !!editando && saldo(editando.codigo) > 0;

    return (
        <>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Nome ou código</label>
                    <input
                        placeholder="Ex.: Ração ou RC001"
                        value={campos.busca}
                        onChange={e => setCampos({ ...campos, busca: e.target.value })}
                        onKeyDown={e => e.key === "Enter" && buscar()}
                    />
                </div>
                <div>
                    <label>Tipo</label>
                    <select aria-label="Filtrar por tipo" value={campos.tipo} onChange={e => setCampos({ ...campos, tipo: e.target.value })}>
                        <option value="">Todos</option>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label>Situação</label>
                    <select
                        aria-label="Filtrar por situação"
                        value={campos.situacao}
                        onChange={e => setCampos({ ...campos, situacao: e.target.value as FiltroSituacao })}
                    >
                        <option value="ativos">Ativos</option>
                        <option value="inativos">Inativos</option>
                        <option value="todos">Todos</option>
                    </select>
                </div>
                <button type="button" className={styles.btnBuscar} onClick={buscar}>Buscar</button>
                {temFiltro && <button type="button" className={styles.btnLimpar} onClick={limpar}>Limpar</button>}
                <button type="button" className={styles.btnNovo} onClick={abrirNovo}>
                    <Plus size={16} aria-hidden /> Novo produto
                </button>
            </div>

            {!carregando && (
                <p className={styles.contador}>
                    {lista.length === produtos.length
                        ? `${produtos.length} produtos cadastrados`
                        : `Mostrando ${lista.length} de ${produtos.length} produtos`}
                </p>
            )}

            <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Unidade</th>
                            <th>Em estoque</th>
                            <th>Situação</th>
                            <th><span className={styles.somenteLeitor}>Ações</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map(p => (
                            <tr key={p.id} className={p.ativo ? undefined : styles.linhaInativa}>
                                <td><span className={styles.codPill}>{p.codigo}</span></td>
                                <td>
                                    <span className={styles.nome}>{p.nome}</span>
                                    {p.descricao && <span className={styles.descricao}>{p.descricao}</span>}
                                </td>
                                <td>{p.tipo}</td>
                                <td>{p.unidade}</td>
                                <td className={styles.numero}>{saldo(p.codigo)} {p.unidade}</td>
                                <td>
                                    <span className={`${styles.badge} ${p.ativo ? styles.badgeAtivo : styles.badgeInativo}`}>
                                        {p.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td className={styles.acoes}>
                                    <button type="button" className={styles.btnAcao} onClick={() => abrirEdicao(p)}>
                                        <Pencil size={14} aria-hidden /> Editar
                                    </button>
                                    {p.ativo ? (
                                        <button type="button" className={`${styles.btnAcao} ${styles.btnDesativar}`} onClick={() => setParaDesativar(p)}>
                                            <Power size={14} aria-hidden /> Desativar
                                        </button>
                                    ) : (
                                        <button type="button" className={styles.btnAcao} onClick={() => reativar(p)}>
                                            <Power size={14} aria-hidden /> Reativar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {lista.length === 0 && (
                            <tr>
                                <td colSpan={7} className={styles.semResultados}>
                                    {carregando ? "Carregando…" : "Nenhum produto encontrado com esses filtros."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de cadastro / edição */}
            {modalAberto && (
                <div className={styles.backdrop} onClick={() => setModalAberto(false)}>
                    <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={salvar}>
                        <div className={styles.modalHeader}>
                            <h2>{editando ? `Editar produto ${editando.codigo}` : "Novo produto"}</h2>
                            <button type="button" className={styles.btnFechar} onClick={() => setModalAberto(false)} aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.row2}>
                                <div className={styles.campo}>
                                    <label>Tipo *</label>
                                    <select aria-label="Tipo" value={form.tipo} onChange={e => trocarTipo(e.target.value)}>
                                        <option value="">Selecione</option>
                                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className={styles.campo}>
                                    <label>Código *</label>
                                    <input
                                        aria-label="Código"
                                        placeholder="Escolha o tipo"
                                        value={form.codigo}
                                        disabled={!!editando}
                                        onChange={e => alterarForm({ codigo: e.target.value.toUpperCase() })}
                                    />
                                    {editando
                                        ? <span className={styles.dica}>O código não muda depois de cadastrado</span>
                                        : codigoSugerido && form.codigo === codigoSugerido && <span className={styles.dica}>Sugerido pelo tipo; pode alterar</span>}
                                </div>
                            </div>

                            <div className={styles.campo}>
                                <label>Nome do produto *</label>
                                <input
                                    aria-label="Nome do produto"
                                    placeholder="Ex.: Ração de Cachorro"
                                    value={form.nome}
                                    onChange={e => alterarForm({ nome: e.target.value })}
                                />
                            </div>

                            <div className={styles.campo}>
                                <label>Unidade de medida</label>
                                <select
                                    aria-label="Unidade de medida"
                                    value={form.unidade}
                                    disabled={unidadeTravada}
                                    onChange={e => alterarForm({ unidade: e.target.value })}
                                >
                                    <option value="kg">kg (quilos)</option>
                                    <option value="un">un (unidades)</option>
                                </select>
                                {unidadeTravada && (
                                    <span className={styles.dica}>
                                        Tem {saldo(editando!.codigo)} {editando!.unidade} em estoque: a unidade não pode mudar
                                    </span>
                                )}
                            </div>

                            <div className={styles.campo}>
                                <label>Descrição</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Descrição opcional do produto..."
                                    value={form.descricao}
                                    onChange={e => alterarForm({ descricao: e.target.value })}
                                />
                            </div>

                            {erro && <p className={styles.msgErro}>{erro}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnCancelar} onClick={() => setModalAberto(false)}>Cancelar</button>
                            <button type="submit" className={styles.btnSalvar}>{editando ? "Salvar alterações" : "Cadastrar produto"}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Confirmação de desativar */}
            {paraDesativar && (
                <div className={styles.backdrop} onClick={() => setParaDesativar(null)}>
                    <div className={styles.modalConfirmar} role="alertdialog" aria-modal="true" aria-labelledby="titulo-desativar" onClick={e => e.stopPropagation()}>
                        <div className={styles.confirmarIcone}><TriangleAlert size={26} aria-hidden /></div>
                        <h2 id="titulo-desativar">Desativar {paraDesativar.nome} ({paraDesativar.codigo})?</h2>
                        <ul className={styles.confirmarLista}>
                            <li>Ele <strong>deixa de aparecer no recebimento</strong> de doações.</li>
                            <li>O estoque e o histórico continuam.{saldo(paraDesativar.codigo) > 0 && ` Ainda tem ${saldo(paraDesativar.codigo)} ${paraDesativar.unidade} em estoque.`}</li>
                            <li>Dá para reativar depois.</li>
                        </ul>
                        <div className={styles.confirmarBotoes}>
                            <button type="button" className={styles.btnCancelar} onClick={() => setParaDesativar(null)} autoFocus>Cancelar</button>
                            <button type="button" className={styles.btnConfirmarDesativar} onClick={confirmarDesativar}>Desativar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
