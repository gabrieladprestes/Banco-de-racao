"use client";
import { useEffect, useState } from "react";
import styles from "./AdminConsultaDonatario.module.css";
import { IAdminDonatario } from "../../interfaces/adminDonatario.interface";
import { listarDonatarios } from "../../services/donatarios.service";
import { somenteDigitos } from "../../utils/textoUtils";

export function AdminConsultaDonatario() {
    const [busca, setBusca] = useState("");
    const [selecionado, setSelecionado] = useState<IAdminDonatario | null>(null);
    const [donatarios, setDonatarios] = useState<IAdminDonatario[]>([]);

    useEffect(() => {
        listarDonatarios().then(setDonatarios);
    }, []);

    // Nome, ou CPF com ou sem pontuação
    const digitos = somenteDigitos(busca);
    const lista = donatarios.filter(d =>
        d.nome.toLowerCase().includes(busca.trim().toLowerCase()) ||
        (digitos.length > 0 && somenteDigitos(d.cpf).includes(digitos))
    );

    function fecharModal() {
        setSelecionado(null);
    }

    return (
        <>
            <div className={styles.buscaBar}>
                <input
                    placeholder="Buscar por nome ou CPF..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                    </tr>
                </thead>
                <tbody>
                    {lista.map(d => (
                        <tr key={d.id} onClick={() => setSelecionado(d)}>
                            <td>{d.nome}</td>
                            <td>{d.cpf}</td>
                            <td>{d.telefone}</td>
                        </tr>
                    ))}
                    {lista.length === 0 && (
                        <tr>
                            <td colSpan={3} className={styles.semResultados}>
                                Nenhum donatário encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selecionado && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Dados do Donatário</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Nome</span>
                                <span>{selecionado.nome}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF</span>
                                <span>{selecionado.cpf}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionado.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Endereço</span>
                                <span>{selecionado.endereco}</span>
                            </div>

                            {selecionado.pets.length > 0 && (
                                <div className={styles.petsSection}>
                                    <h4>Pets cadastrados</h4>
                                    <div className={styles.petChips}>
                                        {selecionado.pets.map(pet => (
                                            <span key={pet.id} className={styles.petChip}>
                                                {pet.nome} — {pet.especie}
                                            </span>
                                        ))}
                                    </div>
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
