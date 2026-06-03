"use client";
import { useState } from "react";
import styles from "./AdminConsultaEstoque.module.css";
import { IAdminEstoque, IAdminEstoqueLote } from "../../interfaces/adminEstoque.interface";

const mockEstoque: IAdminEstoque[] = [
    {
        id: 1, codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",
        lotes: [
            { lote: "L001", saldoEstoque: 45, saldoReservado: 12, validade: "2026-12-01" },
            { lote: "L002", saldoEstoque: 30, saldoReservado: 5,  validade: "2026-08-10" },
            { lote: "L003", saldoEstoque: 10, saldoReservado: 10, validade: "2026-06-20" },
        ],
    },
    {
        id: 2, codigo: "RG001", nome: "Ração de Gato", tipo: "Ração",
        lotes: [
            { lote: "L004", saldoEstoque: 20, saldoReservado: 8,  validade: "2026-11-15" },
            { lote: "L005", saldoEstoque: 8,  saldoReservado: 6,  validade: "2026-06-15" },
            { lote: "L006", saldoEstoque: 5,  saldoReservado: 0,  validade: "2026-05-10" },
        ],
    },
    {
        id: 3, codigo: "VC001", nome: "Vermífugo Cães", tipo: "Medicamento",
        lotes: [
            { lote: "M001", saldoEstoque: 60, saldoReservado: 20, validade: "2027-03-01" },
        ],
    },
    {
        id: 4, codigo: "VG001", nome: "Vermífugo Gatos", tipo: "Medicamento",
        lotes: [
            { lote: "M002", saldoEstoque: 40, saldoReservado: 15, validade: "2026-07-10" },
        ],
    },
    {
        id: 5, codigo: "AP001", nome: "Antipulgas", tipo: "Medicamento",
        lotes: [
            { lote: "M003", saldoEstoque: 25, saldoReservado: 25, validade: "2026-06-20" },
        ],
    },
    {
        id: 6, codigo: "PC001", nome: "Petisco Cachorro", tipo: "Petisco",
        lotes: [
            { lote: "P001", saldoEstoque: 15, saldoReservado: 3,  validade: "2026-09-30" },
        ],
    },
    {
        id: 7, codigo: "PG001", nome: "Petisco Gato", tipo: "Petisco",
        lotes: [
            { lote: "P002", saldoEstoque: 12, saldoReservado: 4,  validade: "2026-06-25" },
        ],
    },
];

type StatusValidade = "vencido" | "vencendo" | "bom";

function statusValidade(validade: string): StatusValidade {
    const hoje = new Date();
    const dataVal = new Date(validade);
    const diffDias = Math.floor((dataVal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias < 0) return "vencido";
    if (diffDias <= 30) return "vencendo";
    return "bom";
}

function statusGeral(lotes: IAdminEstoqueLote[]): StatusValidade {
    const statuses = lotes.map(l => statusValidade(l.validade));
    if (statuses.includes("vencido")) return "vencido";
    if (statuses.includes("vencendo")) return "vencendo";
    return "bom";
}

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

function totalEstoque(lotes: IAdminEstoqueLote[]) {
    return lotes.reduce((acc, l) => acc + l.saldoEstoque, 0);
}

function totalReservado(lotes: IAdminEstoqueLote[]) {
    return lotes.reduce((acc, l) => acc + l.saldoReservado, 0);
}

export const AdminConsultaEstoque = () => {
    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");
    const [resultado, setResultado] = useState<IAdminEstoque[]>(mockEstoque);
    const [produtoSelecionado, setProdutoSelecionado] = useState<IAdminEstoque | null>(null);

    function buscar() {
        setResultado(mockEstoque.filter(item => {
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
                        const disponivel = totalE - totalR;
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
                                        <th>Lote</th>
                                        <th>Saldo Estoque</th>
                                        <th>Saldo Reservado</th>
                                        <th>Disponível</th>
                                        <th>Validade</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtoSelecionado.lotes.map(lote => {
                                        const disp = lote.saldoEstoque - lote.saldoReservado;
                                        const sv = statusValidade(lote.validade);
                                        return (
                                            <tr key={lote.lote}>
                                                <td>{lote.lote}</td>
                                                <td>{lote.saldoEstoque}</td>
                                                <td>{lote.saldoReservado}</td>
                                                <td className={disp < 0 ? styles.dispNegativo : styles.dispPositivo}>
                                                    {disp}
                                                </td>
                                                <td>{new Date(lote.validade).toLocaleDateString("pt-BR")}</td>
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
