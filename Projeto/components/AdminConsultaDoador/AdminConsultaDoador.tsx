"use client";
import { useEffect, useState } from "react";
import styles from "./AdminConsultaDoador.module.css";
import { IAdminDoador } from "../../interfaces/adminDoador.interface";
import { listarDoadores } from "../../services/doadores.service";
import { formatarData } from "../../utils/dateUtils";
import { somenteDigitos } from "../../utils/textoUtils";

export function AdminConsultaDoador() {
    const [busca, setBusca] = useState("");
    const [selecionado, setSelecionado] = useState<IAdminDoador | null>(null);
    const [doadores, setDoadores] = useState<IAdminDoador[]>([]);

    useEffect(() => {
        listarDoadores().then(setDoadores);
    }, []);

    // Nome, ou CPF/CNPJ com ou sem pontuação
    const digitos = somenteDigitos(busca);
    const lista = doadores.filter(d =>
        d.nome.toLowerCase().includes(busca.trim().toLowerCase()) ||
        (digitos.length > 0 && somenteDigitos(d.cpfCnpj).includes(digitos))
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
                                                    <td>{formatarData(h.data)}</td>
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
