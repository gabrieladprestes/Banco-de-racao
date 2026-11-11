"use client";
import { useEffect, useState } from "react";
import styles from "./AdminConsultaEstoque.module.css";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import {
    FiltroSituacao,
    ISituacaoEstoque,
    StatusValidade,
    disponivelParaLiberar,
    situacaoEstoque,
    statusValidade,
    temSituacao,
    textoLoteFabricante,
    textoPrazo,
    totalEstoque,
    totalReservado,
} from "../../utils/estoqueUtils";
import { X } from "lucide-react";

const SITUACOES: { valor: FiltroSituacao; texto: string }[] = [
    { valor: "ok", texto: "OK" },
    { valor: "vencendo", texto: "Vence em breve" },
    { valor: "vencido", texto: "Com lote vencido" },
    { valor: "sem-estoque", texto: "Sem estoque" },
];
const ehFiltroSituacao = (valor: string | null): valor is FiltroSituacao =>
    SITUACOES.some(s => s.valor === valor);

const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;

// Etiquetas da coluna Situação: um produto pode ter mais de uma ao mesmo tempo
function etiquetasSituacao(s: ISituacaoEstoque, unidade: string) {
    const etiquetas: { texto: string; classe: string }[] = [];
    if (s.semEstoque) etiquetas.push({ texto: "Sem estoque", classe: styles.badgeSemEstoque });
    if (s.lotesVencidos > 0) etiquetas.push({
        texto: `${plural(s.lotesVencidos, "lote vencido", "lotes vencidos")} (${s.saldoVencido} ${unidade})`,
        classe: styles.badgeVencido,
    });
    if (s.lotesVencendo > 0) etiquetas.push({ texto: "Vence em breve", classe: styles.badgeVencendo });
    if (etiquetas.length === 0) etiquetas.push({ texto: "OK", classe: styles.badgeBom });
    return etiquetas;
}

function badgeLote(status: StatusValidade) {
    if (status === "vencido") return styles.badgeVencido;
    if (status === "vencendo") return styles.badgeVencendo;
    return styles.badgeBom;
}

function textoLote(status: StatusValidade, saldo: number) {
    if (status === "vencido") return saldo > 0 ? "Vencido — descartar" : "Vencido";
    if (status === "vencendo") return "Vencendo";
    return "Bom";
}

function filtrar(estoque: IAdminEstoque[], tipo: string, busca: string, situacao: string) {
    const termo = busca.trim().toLowerCase();
    return estoque.filter(item =>
        (!tipo || item.tipo === tipo) &&
        (!termo || item.nome.toLowerCase().includes(termo) || item.codigo.toLowerCase().includes(termo)) &&
        (!ehFiltroSituacao(situacao) || temSituacao(situacaoEstoque(item.lotes), situacao))
    );
}

export const AdminConsultaEstoque = () => {
    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState("");
    const [filtroSituacao, setFiltroSituacao] = useState("");
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    const [resultado, setResultado] = useState<IAdminEstoque[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [produtoSelecionado, setProdutoSelecionado] = useState<IAdminEstoque | null>(null);

    useEffect(() => {
        // Os cards do Dashboard abrem a tela já filtrada: /Admin/ConsultaEstoque?situacao=vencido
        const situacaoInicial = new URLSearchParams(window.location.search).get("situacao");
        const situacao = ehFiltroSituacao(situacaoInicial) ? situacaoInicial : "";
        buscarEstoque().then(dados => {
            setEstoque(dados);
            setFiltroSituacao(situacao);
            setResultado(filtrar(dados, "", "", situacao));
            setCarregando(false);
        });
    }, []);

    function buscar() {
        setResultado(filtrar(estoque, tipo, busca, filtroSituacao));
    }

    function limparFiltros() {
        setTipo("");
        setBusca("");
        setFiltroSituacao("");
        setResultado(estoque);
    }

    const temFiltro = tipo !== "" || busca !== "" || filtroSituacao !== "";

    // Lotes do modal: o que vence primeiro em cima (mesma ordem da Saída de Doação)
    const lotesOrdenados = produtoSelecionado
        ? [...produtoSelecionado.lotes].sort((a, b) => a.validade.localeCompare(b.validade))
        : [];

    return (
        <>
            <div className={styles.filtros}>
                <div>
                    <label>Tipo</label>
                    <select aria-label="Filtrar por tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="Ração">Ração</option>
                        <option value="Medicamento">Medicamento</option>
                        <option value="Petisco">Petisco</option>
                        <option value="Outros">Outros</option>
                    </select>
                </div>
                <div>
                    <label>Nome ou código</label>
                    <input
                        placeholder="Ex.: Ração ou RC001"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && buscar()}
                    />
                </div>
                <div>
                    <label>Situação</label>
                    <select aria-label="Filtrar por situação" value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)}>
                        <option value="">Todas</option>
                        {SITUACOES.map(s => <option key={s.valor} value={s.valor}>{s.texto}</option>)}
                    </select>
                </div>
                <button type="button" className={styles.btnBuscar} onClick={buscar}>Buscar</button>
                {temFiltro && (
                    <button type="button" className={styles.btnLimpar} onClick={limparFiltros}>Limpar filtros</button>
                )}
            </div>

            {!carregando && (
                <p className={styles.contador}>
                    {resultado.length === estoque.length
                        ? plural(estoque.length, "item no estoque", "itens no estoque")
                        : `Mostrando ${resultado.length} de ${plural(estoque.length, "item", "itens")}`}
                </p>
            )}

            <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Item</th>
                            <th>Tipo</th>
                            <th>Em estoque</th>
                            <th>Reservado</th>
                            <th>Disponível</th>
                            <th>Situação</th>
                            <th>Lotes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultado.length === 0 && (
                            <tr>
                                <td colSpan={8} className={styles.semResultados}>
                                    {carregando ? "Carregando…" : "Nenhum item encontrado com esses filtros."}
                                    {!carregando && temFiltro && (
                                        <button type="button" className={styles.linkLimpar} onClick={limparFiltros}>Limpar filtros</button>
                                    )}
                                </td>
                            </tr>
                        )}
                        {resultado.map(item => {
                            // Mesma regra em todas as telas: lotes dentro da validade, menos o reservado
                            const disponivel = disponivelParaLiberar(item.lotes);
                            const u = item.unidade;
                            return (
                                <tr key={item.id}>
                                    <td>{item.codigo}</td>
                                    <td>{item.nome}</td>
                                    <td>{item.tipo}</td>
                                    <td className={styles.numero}>{totalEstoque(item.lotes)} {u}</td>
                                    <td className={styles.numero}>{totalReservado(item.lotes)} {u}</td>
                                    <td className={`${styles.numero} ${disponivel > 0 ? styles.dispPositivo : styles.dispZero}`}>
                                        {disponivel} {u}
                                    </td>
                                    <td>
                                        <div className={styles.etiquetas}>
                                            {etiquetasSituacao(situacaoEstoque(item.lotes), u).map(e => (
                                                <span key={e.texto} className={`${styles.badge} ${e.classe}`}>{e.texto}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.btnVerLotes}
                                            onClick={() => setProdutoSelecionado(item)}
                                        >
                                            Ver lotes ({item.lotes.length})
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className={styles.legenda}>
                Disponível = saldo dos lotes dentro da validade, menos o que está reservado para retiradas aprovadas.
                Lote vencido não entra no disponível e precisa ser descartado.
            </p>

            {produtoSelecionado && (
                <div className={styles.backdrop} onClick={() => setProdutoSelecionado(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalCodigo}>{produtoSelecionado.codigo}</span>
                                <h2>{produtoSelecionado.nome}</h2>
                            </div>
                            <button
                                type="button"
                                className={styles.btnFechar}
                                onClick={() => setProdutoSelecionado(null)}
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            {lotesOrdenados.length === 0 ? (
                                <p className={styles.semResultados}>Nenhum lote cadastrado para este produto.</p>
                            ) : (
                                <div className={styles.tabelaWrapper}>
                                    <table className={styles.tabelaLotes}>
                                        <thead>
                                            <tr>
                                                <th>Lote interno</th>
                                                <th>Lote fabricante</th>
                                                <th>Em estoque</th>
                                                <th>Reservado</th>
                                                <th>Disponível</th>
                                                <th>Validade</th>
                                                <th>Situação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lotesOrdenados.map(lote => {
                                                const sv = statusValidade(lote.validade);
                                                const disp = sv === "vencido" ? 0 : Math.max(lote.saldoEstoque - lote.saldoReservado, 0);
                                                const descartar = sv === "vencido" && lote.saldoEstoque > 0;
                                                const u = produtoSelecionado.unidade;
                                                return (
                                                    <tr key={lote.lote} className={descartar ? styles.loteDescartar : undefined}>
                                                        <td>{lote.lote}</td>
                                                        <td>{textoLoteFabricante(lote.loteFabricante)}</td>
                                                        <td className={styles.numero}>{lote.saldoEstoque} {u}</td>
                                                        <td className={styles.numero}>{lote.saldoReservado} {u}</td>
                                                        <td className={`${styles.numero} ${disp > 0 ? styles.dispPositivo : styles.dispZero}`}>
                                                            {disp} {u}
                                                        </td>
                                                        <td>
                                                            {formatarData(lote.validade)}
                                                            <span className={styles.prazo}>{textoPrazo(lote.validade)}</span>
                                                        </td>
                                                        <td>
                                                            <span className={`${styles.badge} ${badgeLote(sv)}`}>
                                                                {textoLote(sv, lote.saldoEstoque)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan={2}>Total</td>
                                                <td className={styles.numero}>{totalEstoque(produtoSelecionado.lotes)} {produtoSelecionado.unidade}</td>
                                                <td className={styles.numero}>{totalReservado(produtoSelecionado.lotes)} {produtoSelecionado.unidade}</td>
                                                <td className={styles.numero}>{disponivelParaLiberar(produtoSelecionado.lotes)} {produtoSelecionado.unidade}</td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
