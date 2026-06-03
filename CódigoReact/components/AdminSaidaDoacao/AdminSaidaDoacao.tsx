"use client";
import { useState } from "react";
import styles from "./AdminSaidaDoacao.module.css";
import { IAdminSaidaDoacao } from "../../interfaces/adminSaidaDoacao.interface";

const mockSaidas: IAdminSaidaDoacao[] = [
    { id: 1,  codigoAgendamento: "RET-2026-001", nomeDonatario: "Beatriz Lima",      cpf: "123.456.789-01", telefone: "(15) 98765-0001", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 5,  quantidadeEntregue: 5  }], dataAgendada: "2026-06-01", status: "aguardando" },
    { id: 2,  codigoAgendamento: "RET-2026-002", nomeDonatario: "Marcos Souza",      cpf: "234.567.890-12", telefone: "(15) 97654-0002", itens: [{ item: "Ração de Gato",     quantidadeSolicitada: 3,  quantidadeEntregue: 3  }], dataAgendada: "2026-06-02", status: "aguardando" },
    { id: 3,  codigoAgendamento: "RET-2026-003", nomeDonatario: "Luciana Ferreira",  cpf: "345.678.901-23", telefone: "(15) 98877-0003", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 8,  quantidadeEntregue: 8  }, { item: "Ração de Gato", quantidadeSolicitada: 2, quantidadeEntregue: 2 }], dataAgendada: "2026-06-03", status: "aguardando" },
    { id: 4,  codigoAgendamento: "RET-2026-004", nomeDonatario: "Paulo Henrique",    cpf: "456.789.012-34", telefone: "(15) 96543-0004", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 10, quantidadeEntregue: 10 }], dataAgendada: "2026-06-05", status: "aguardando" },
    { id: 5,  codigoAgendamento: "RET-2026-005", nomeDonatario: "Cristina Almeida",  cpf: "567.890.123-45", telefone: "(15) 99001-0005", itens: [{ item: "Ração de Gato",     quantidadeSolicitada: 5,  quantidadeEntregue: 5  }], dataAgendada: "2026-06-08", status: "aguardando" },
    { id: 6,  codigoAgendamento: "RET-2026-006", nomeDonatario: "Diego Nascimento",  cpf: "678.901.234-56", telefone: "(15) 98112-0006", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 6,  quantidadeEntregue: 6  }, { item: "Ração de Gato", quantidadeSolicitada: 4, quantidadeEntregue: 4 }], dataAgendada: "2026-06-10", status: "aguardando" },
    { id: 7,  codigoAgendamento: "RET-2026-007", nomeDonatario: "Simone Martins",    cpf: "789.012.345-67", telefone: "(15) 97223-0007", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 4,  quantidadeEntregue: 4  }], dataAgendada: "2026-06-12", status: "aguardando" },
    { id: 8,  codigoAgendamento: "RET-2026-008", nomeDonatario: "Tadeu Ribeiro",     cpf: "890.123.456-78", telefone: "(15) 98334-0008", itens: [{ item: "Ração de Gato",     quantidadeSolicitada: 7,  quantidadeEntregue: 7  }], dataAgendada: "2026-06-15", status: "aguardando" },
    { id: 9,  codigoAgendamento: "RET-2026-009", nomeDonatario: "Vanessa Rocha",     cpf: "901.234.567-89", telefone: "(15) 96445-0009", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 12, quantidadeEntregue: 12 }, { item: "Ração de Gato", quantidadeSolicitada: 3, quantidadeEntregue: 3 }], dataAgendada: "2026-06-18", status: "aguardando" },
    { id: 10, codigoAgendamento: "RET-2026-010", nomeDonatario: "Eduardo Campos",    cpf: "012.345.678-90", telefone: "(15) 99556-0010", itens: [{ item: "Ração de Cachorro", quantidadeSolicitada: 9,  quantidadeEntregue: 9  }], dataAgendada: "2026-06-20", status: "aguardando" },
];

const saidasPendentes = mockSaidas.filter(s => s.status === "aguardando");

export function AdminSaidaDoacao() {
    const [selecionada, setSelecionada] = useState<IAdminSaidaDoacao | null>(null);
    const [observacao, setObservacao] = useState("");
    const [filtroData, setFiltroData] = useState("");
    const [filtroDonatario, setFiltroDonatario] = useState("");
    const [resultado, setResultado] = useState<IAdminSaidaDoacao[]>(saidasPendentes);
    const [quantidadesEntregues, setQuantidadesEntregues] = useState<number[]>([]);

    function filtrar() {
        setResultado(saidasPendentes.filter(s =>
            (!filtroData || s.dataAgendada === filtroData) &&
            (!filtroDonatario || s.nomeDonatario.toLowerCase().includes(filtroDonatario.toLowerCase()))
        ));
    }

    function abrirModal(saida: IAdminSaidaDoacao) {
        setSelecionada(saida);
        setObservacao("");
        setQuantidadesEntregues(saida.itens.map(i => i.quantidadeEntregue));
    }

    function fecharModal() {
        setSelecionada(null);
        setObservacao("");
    }

    function atualizarQuantidade(index: number, valor: number) {
        const novas = [...quantidadesEntregues];
        novas[index] = valor;
        setQuantidadesEntregues(novas);
    }

    function resumoItens(saida: IAdminSaidaDoacao) {
        return saida.itens.map(i => `${i.item} (${i.quantidadeSolicitada} kg)`).join(", ");
    }

    return (
        <>
            <div className={styles.filtros}>
                <div>
                    <label>Data agendada</label>
                    <input
                        type="date"
                        aria-label="Filtrar por data"
                        value={filtroData}
                        onChange={e => setFiltroData(e.target.value)}
                    />
                </div>
                <div>
                    <label>Donatário</label>
                    <input
                        placeholder="Nome do donatário..."
                        value={filtroDonatario}
                        onChange={e => setFiltroDonatario(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && filtrar()}
                    />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={filtrar}>Filtrar</button>
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Cód. Agendamento</th>
                        <th>Donatário</th>
                        <th>Itens</th>
                        <th>Data agendada</th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.map(saida => (
                        <tr key={saida.id} onClick={() => abrirModal(saida)}>
                            <td>{saida.codigoAgendamento}</td>
                            <td>{saida.nomeDonatario}</td>
                            <td>{resumoItens(saida)}</td>
                            <td>{new Date(saida.dataAgendada).toLocaleDateString("pt-BR")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selecionada && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Confirmar Saída de Doação</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Cód. Agendamento</span>
                                <span>{selecionada.codigoAgendamento}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Donatário</span>
                                <span>{selecionada.nomeDonatario}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF</span>
                                <span>{selecionada.cpf}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionada.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Data agendada</span>
                                <span>{new Date(selecionada.dataAgendada).toLocaleDateString("pt-BR")}</span>
                            </div>

                            <p className={styles.itensLabel}>Itens para entrega</p>

                            <table className={styles.tabelaItens}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Solicitado</th>
                                        <th>A entregar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selecionada.itens.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.item}</td>
                                            <td>{item.quantidadeSolicitada} kg</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    aria-label={`Quantidade a entregar de ${item.item}`}
                                                    className={styles.inputQtd}
                                                    value={quantidadesEntregues[i] ?? item.quantidadeEntregue}
                                                    min={0}
                                                    onChange={e => atualizarQuantidade(i, Number(e.target.value))}
                                                />
                                                {" kg"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div>
                                <label className={styles.obsLabel}>Observações</label>
                                <textarea
                                    className={styles.obsTextarea}
                                    placeholder="Registre aqui observações sobre esta entrega..."
                                    value={observacao}
                                    onChange={e => setObservacao(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFecharFooter} onClick={fecharModal}>Fechar</button>
                            <button type="button" className={styles.btnCancelar}>Cancelar Entrega</button>
                            <button type="button" className={styles.btnConfirmar}>Confirmar Entrega</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
