"use client";
import { useState } from "react";
import styles from "./AdminConsultaDonatario.module.css";
import { IAdminDonatario } from "../../interfaces/adminDonatario.interface";

const mockDonatarios: IAdminDonatario[] = [
    {
        id: 1,
        nome: "Maria Silva",
        cpf: "123.456.789-00",
        telefone: "(15) 99999-0001",
        endereco: "Rua das Flores, 123 — Votorantim/SP",
        pets: [
            { id: 1, nome: "Rex", especie: "Cachorro" },
            { id: 2, nome: "Mimi", especie: "Gato" },
        ],
    },
    {
        id: 2,
        nome: "João Pereira",
        cpf: "987.654.321-00",
        telefone: "(15) 98888-0002",
        endereco: "Av. Brasil, 456 — Votorantim/SP",
        pets: [
            { id: 3, nome: "Bolinha", especie: "Cachorro" },
        ],
    },
    {
        id: 3,
        nome: "Ana Costa",
        cpf: "111.222.333-44",
        telefone: "(15) 97777-0003",
        endereco: "Rua das Acácias, 789 — Votorantim/SP",
        pets: [],
    },
];

export function AdminConsultaDonatario() {
    const [busca, setBusca] = useState("");
    const [selecionado, setSelecionado] = useState<IAdminDonatario | null>(null);

    const lista = mockDonatarios.filter(d =>
        d.nome.toLowerCase().includes(busca.toLowerCase()) ||
        d.cpf.includes(busca)
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
