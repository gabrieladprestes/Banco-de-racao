"use client";
import { useState } from "react";
import styles from "./AdminConsultaDoador.module.css";
import { IAdminDoador } from "../../interfaces/adminDoador.interface";

const mockDoadores: IAdminDoador[] = [
    {
        id: 1,
        nome: "João Pereira",
        cpfCnpj: "987.654.321-00",
        telefone: "(15) 98888-0002",
        endereco: "Av. Principal, 456 — Votorantim/SP",
        historicoDoacoes: [
            { id: 1, tipo: "Ração de Cachorro", quantidade: 10, data: "2026-03-10" },
            { id: 2, tipo: "Ração de Gato", quantidade: 5, data: "2026-04-22" },
        ],
    },
    {
        id: 2,
        nome: "Empresa XYZ Ltda",
        cpfCnpj: "12.345.678/0001-99",
        telefone: "(15) 3333-0010",
        endereco: "Rua Industrial, 100 — Votorantim/SP",
        historicoDoacoes: [
            { id: 3, tipo: "Ração de Cachorro", quantidade: 50, data: "2026-05-01" },
        ],
    },
    {
        id: 3,
        nome: "Carla Souza",
        cpfCnpj: "222.333.444-55",
        telefone: "(15) 96666-0004",
        endereco: "Rua das Palmeiras, 321 — Votorantim/SP",
        historicoDoacoes: [],
    },
];

export function AdminConsultaDoador() {
    const [busca, setBusca] = useState("");
    const [selecionado, setSelecionado] = useState<IAdminDoador | null>(null);

    const lista = mockDoadores.filter(d =>
        d.nome.toLowerCase().includes(busca.toLowerCase()) ||
        d.cpfCnpj.includes(busca)
    );

    function fecharModal() {
        setSelecionado(null);
    }

    return (
        <>
            <div className={styles.buscaBar}>
                <input
                    placeholder="Buscar por nome ou CPF/CNPJ..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF/CNPJ</th>
                        <th>Telefone</th>
                    </tr>
                </thead>
                <tbody>
                    {lista.map(d => (
                        <tr key={d.id} onClick={() => setSelecionado(d)}>
                            <td>{d.nome}</td>
                            <td>{d.cpfCnpj}</td>
                            <td>{d.telefone}</td>
                        </tr>
                    ))}
                    {lista.length === 0 && (
                        <tr>
                            <td colSpan={3} className={styles.semResultados}>
                                Nenhum doador encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selecionado && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Dados do Doador</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Nome</span>
                                <span>{selecionado.nome}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF/CNPJ</span>
                                <span>{selecionado.cpfCnpj}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionado.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Endereço</span>
                                <span>{selecionado.endereco}</span>
                            </div>

                            {selecionado.historicoDoacoes.length > 0 && (
                                <div className={styles.historicoSection}>
                                    <h4>Histórico de Doações</h4>
                                    <table className={styles.tabelaHistorico}>
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Qtd</th>
                                                <th>Data</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selecionado.historicoDoacoes.map(h => (
                                                <tr key={h.id}>
                                                    <td>{h.tipo}</td>
                                                    <td>{h.quantidade}</td>
                                                    <td>{new Date(h.data).toLocaleDateString("pt-BR")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFecharFooter} onClick={fecharModal}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
