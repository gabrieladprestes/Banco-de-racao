"use client";
import { useEffect, useState } from "react";
import styles from "./AdminConsultaEstoque.module.css";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import { StatusValidade, disponivelParaLiberar, statusGeral, statusValidade, textoLoteFabricante, totalEstoque, totalReservado } from "../../utils/estoqueUtils";

function badgeValidade(status: StatusValidade, s: Record<string, string>) {
    if (status === "vencido") return s.badgeVencido;
    if (status === "vencendo") return s.badgeVencendo;
    return s.badgeBom;
}

function labelValidade(status: StatusValidade) {
    if (status === "vencido") return "Vencido";
    if (status === "vencendo") return "Vencendo";
    return "Bom";
}

export const AdminConsultaEstoque = () => {
    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    const [resultado, setResultado] = useState<IAdminEstoque[]>([]);
    const [produtoSelecionado, setProdutoSelecionado] = useState<IAdminEstoque | null>(null);

    useEffect(() => {
        buscarEstoque().then(dados => {
            setEstoque(dados);
            setResultado(dados);
        });
    }, []);

    function buscar() {
        setResultado(estoque.filter(item => {
            const sg = statusGeral(item.lotes);
            return (
                (!tipo || item.tipo === tipo) &&
                (!busca || item.nome.toLowerCase().includes(busca.toLowerCase())) &&
                (!filtroStatus || sg === filtroStatus)
            );
        }));
    }

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
                    <label>Nome do item</label>
                    <input
                        placeholder="Buscar por nome..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && buscar()}
                    />
                </div>
                <div>
                    <label>Status validade</label>
                    <select aria-label="Filtrar por status de validade" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="bom">Bom</option>
                        <option value="vencendo">Vencendo</option>
                        <option value="vencido">Vencido</option>
                    </select>
                </div>
                <button type="button" className={styles.btnBuscar} onClick={buscar}>Buscar</button>
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Item</th>
                        <th>Tipo</th>
                        <th>Saldo Estoque</th>
                        <th>Saldo Reservado</th>
                        <th>Disponível</th>
                        <th>Status</th>
                        <th>Lotes</th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.map(item => {
                        const totalE = totalEstoque(item.lotes);
                        const totalR = totalReservado(item.lotes);
                        // Mesma regra em todas as telas: lotes dentro da validade, menos o reservado
                        const disponivel = disponivelParaLiberar(item.lotes);
                        const sg = statusGeral(item.lotes);
                        return (
                            <tr key={item.id}>
                                <td>{item.codigo}</td>
                                <td>{item.nome}</td>
                                <td>{item.tipo}</td>
                                <td>{totalE}</td>
                                <td>{totalR}</td>
                                <td className={disponivel < 0 ? styles.dispNegativo : styles.dispPositivo}>
                                    {disponivel}
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${badgeValidade(sg, styles)}`}>
                                        {labelValidade(sg)}
                                    </span>
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
            <p className={styles.legenda}>Disponível = saldo dos lotes dentro da validade, menos o que está reservado para retiradas aprovadas.</p>

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
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <table className={styles.tabelaLotes}>
                                <thead>
                                    <tr>
                                        <th>Lote interno</th>
                                        <th>Lote fabricante</th>
                                        <th>Saldo Estoque</th>
                                        <th>Saldo Reservado</th>
                                        <th>Disponível</th>
                                        <th>Validade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtoSelecionado.lotes.map(lote => {
                                        const sv = statusValidade(lote.validade);
                                        const disp = sv === "vencido" ? 0 : lote.saldoEstoque - lote.saldoReservado;
                                        return (
                                            <tr key={lote.lote}>
                                                <td>{lote.lote}</td>
                                                <td>{textoLoteFabricante(lote.loteFabricante)}</td>
                                                <td>{lote.saldoEstoque}</td>
                                                <td>{lote.saldoReservado}</td>
                                                <td className={disp < 0 ? styles.dispNegativo : styles.dispPositivo}>
                                                    {disp}
                                                </td>
                                                <td>{formatarData(lote.validade)}</td>
                                                <td>
                                                    <span className={`${styles.badge} ${badgeValidade(sv, styles)}`}>
                                                        {labelValidade(sv)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
