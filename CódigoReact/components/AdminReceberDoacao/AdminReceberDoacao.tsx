"use client";
import { useState } from "react";
import styles from "./AdminReceberDoacao.module.css";
import { IAdminDoacaoAgendada } from "../../interfaces/adminDoacaoAgendada.interface";

interface IItemExtra {
    item: string;
    quantidade: number;
}

const TIPOS_ITEM = ["Ração de Cachorro", "Ração de Gato"];

const mockDoacoes: IAdminDoacaoAgendada[] = [
    { id: 1,  codigoAgendamento: "AG-2026-001", nomeDoador: "João Pereira",               cpfCnpj: "987.654.321-00",      telefone: "(15) 98888-0002", item: "Ração de Cachorro", quantidade: 10, dataAgendada: "2026-05-28", status: "agendado" },
    { id: 2,  codigoAgendamento: "AG-2026-002", nomeDoador: "Empresa Ração Certa Ltda",   cpfCnpj: "12.345.678/0001-99",  telefone: "(15) 3333-0001", item: "Ração de Gato",     quantidade: 20, dataAgendada: "2026-05-30", status: "agendado" },
    { id: 3,  codigoAgendamento: "AG-2026-003", nomeDoador: "Maria Oliveira",              cpfCnpj: "111.222.333-44",      telefone: "(15) 97777-0003", item: "Ração de Cachorro", quantidade: 5,  dataAgendada: "2026-06-10", status: "agendado" },
    { id: 4,  codigoAgendamento: "AG-2026-004", nomeDoador: "Carlos Mendes",               cpfCnpj: "222.333.444-55",      telefone: "(15) 99111-2233", item: "Ração de Gato",     quantidade: 8,  dataAgendada: "2026-06-12", status: "agendado" },
    { id: 5,  codigoAgendamento: "AG-2026-005", nomeDoador: "PetShop Amigo Fiel Ltda",    cpfCnpj: "98.765.432/0001-10",  telefone: "(15) 3210-5500", item: "Ração de Cachorro", quantidade: 50, dataAgendada: "2026-06-15", status: "agendado" },
    { id: 6,  codigoAgendamento: "AG-2026-006", nomeDoador: "Ana Paula Santos",            cpfCnpj: "333.444.555-66",      telefone: "(15) 98765-4321", item: "Ração de Gato",     quantidade: 12, dataAgendada: "2026-06-18", status: "agendado" },
    { id: 7,  codigoAgendamento: "AG-2026-007", nomeDoador: "Supermercado Bom Preço Ltda",cpfCnpj: "11.222.333/0001-44",  telefone: "(15) 3344-5566", item: "Ração de Cachorro", quantidade: 30, dataAgendada: "2026-06-20", status: "agendado" },
    { id: 8,  codigoAgendamento: "AG-2026-008", nomeDoador: "Roberto Alves",               cpfCnpj: "444.555.666-77",      telefone: "(15) 97654-3210", item: "Ração de Gato",     quantidade: 6,  dataAgendada: "2026-06-22", status: "agendado" },
    { id: 9,  codigoAgendamento: "AG-2026-009", nomeDoador: "Fernanda Costa",              cpfCnpj: "555.666.777-88",      telefone: "(15) 99887-6655", item: "Ração de Cachorro", quantidade: 15, dataAgendada: "2026-06-25", status: "agendado" },
    { id: 10, codigoAgendamento: "AG-2026-010", nomeDoador: "Distribuidora AnimalVida SA", cpfCnpj: "55.444.333/0001-22",  telefone: "(15) 3456-7890", item: "Ração de Gato",     quantidade: 40, dataAgendada: "2026-07-02", status: "agendado" },
];

const doacoesPendentes = mockDoacoes.filter(d => d.status === "agendado");

function badgeClass(status: string) {
    if (status === "recebido") return styles.badgeRecebido;
    if (status === "recusado") return styles.badgeRecusado;
    return styles.badgeAgendado;
}

function labelStatus(status: string) {
    if (status === "recebido") return "Recebido";
    if (status === "recusado") return "Recusado";
    return "Agendado";
}

export function AdminReceberDoacao() {
    const [selecionada, setSelecionada] = useState<IAdminDoacaoAgendada | null>(null);
    const [observacao, setObservacao] = useState("");
    const [filtroData, setFiltroData] = useState("");
    const [filtroDoador, setFiltroDoador] = useState("");
    const [resultado, setResultado] = useState<IAdminDoacaoAgendada[]>(doacoesPendentes);

    // Estado do modal — itens editáveis
    const [quantidadeEditada, setQuantidadeEditada] = useState(0);
    const [itensExtras, setItensExtras] = useState<IItemExtra[]>([]);
    const [novoItemTipo, setNovoItemTipo] = useState(TIPOS_ITEM[0]);
    const [novaQtd, setNovaQtd] = useState(1);
    const [mostrarAddItem, setMostrarAddItem] = useState(false);
    const [itemPrincipalRemovido, setItemPrincipalRemovido] = useState(false);
    const [loteEditado, setLoteEditado] = useState("");

    const filtrar = () => {
        setResultado(doacoesPendentes.filter(d =>
            (!filtroData || d.dataAgendada === filtroData) &&
            (!filtroDoador || d.nomeDoador.toLowerCase().includes(filtroDoador.toLowerCase()))
        ));
    };

    function abrirModal(doacao: IAdminDoacaoAgendada) {
        setSelecionada(doacao);
        setObservacao("");
        setQuantidadeEditada(doacao.quantidade);
        setItensExtras([]);
        setNovoItemTipo(TIPOS_ITEM[0]);
        setNovaQtd(1);
        setMostrarAddItem(false);
        setItemPrincipalRemovido(false);
        setLoteEditado("");
    }

    function fecharModal() {
        setSelecionada(null);
        setObservacao("");
    }

    function adicionarItemExtra() {
        if (novaQtd <= 0) return;
        setItensExtras([...itensExtras, { item: novoItemTipo, quantidade: novaQtd }]);
        setNovaQtd(1);
        setMostrarAddItem(false);
    }

    function removerItemExtra(index: number) {
        setItensExtras(itensExtras.filter((_, i) => i !== index));
    }

    return (
        <>
            <div className={styles.filtros}>
                <div>
                    <label>Data agendada</label>
                    <input type="date" aria-label="Filtrar por data" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
                </div>
                <div>
                    <label>Doador</label>
                    <input placeholder="Nome do doador..." value={filtroDoador} onChange={e => setFiltroDoador(e.target.value)} />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={filtrar}>Filtrar</button>
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Cód. Agendamento</th>
                        <th>Doador</th>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Data agendada</th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.map(doacao => (
                        <tr key={doacao.id} onClick={() => abrirModal(doacao)}>
                            <td>{doacao.codigoAgendamento}</td>
                            <td>{doacao.nomeDoador}</td>
                            <td>{doacao.item}</td>
                            <td>{doacao.quantidade}</td>
                            <td>{new Date(doacao.dataAgendada).toLocaleDateString("pt-BR")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selecionada && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Detalhes da Doação</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Cód. Agendamento</span>
                                <span>{selecionada.codigoAgendamento}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Doador</span>
                                <span>{selecionada.nomeDoador}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF / CNPJ</span>
                                <span>{selecionada.cpfCnpj}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionada.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Data agendada</span>
                                <span>{new Date(selecionada.dataAgendada).toLocaleDateString("pt-BR")}</span>
                            </div>
                            {/* Seção de itens */}
                            <p className={styles.itensLabel}>Itens do recebimento</p>

                            {/* Item principal com lote, quantidade editáveis */}
                            {!itemPrincipalRemovido && (
                                <div className={styles.itemLinha}>
                                    <span className={styles.itemNome}>{selecionada.item}</span>
                                    <div className={styles.itemQtdWrapper}>
                                        <input
                                            placeholder="Lote"
                                            aria-label="Lote do item"
                                            className={styles.inputLote}
                                            value={loteEditado}
                                            onChange={e => setLoteEditado(e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            aria-label="Quantidade do item"
                                            className={styles.inputQtd}
                                            value={quantidadeEditada}
                                            min={0}
                                            onChange={e => setQuantidadeEditada(Number(e.target.value))}
                                        />
                                        <span className={styles.unidade}>kg</span>
                                        <button
                                            type="button"
                                            className={styles.btnRemover}
                                            onClick={() => setItemPrincipalRemovido(true)}
                                            aria-label="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Itens extras adicionados */}
                            {itensExtras.map((extra, i) => (
                                <div key={i} className={styles.itemLinha}>
                                    <span className={styles.itemNome}>{extra.item}</span>
                                    <div className={styles.itemQtdWrapper}>
                                        <span className={styles.itemQtdTexto}>{extra.quantidade} kg</span>
                                        <button
                                            type="button"
                                            className={styles.btnRemover}
                                            onClick={() => removerItemExtra(i)}
                                            aria-label="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Adicionar item extra */}
                            {!mostrarAddItem ? (
                                <button
                                    type="button"
                                    className={styles.btnMostrarAdd}
                                    onClick={() => setMostrarAddItem(true)}
                                >
                                    + Adicionar produto
                                </button>
                            ) : (
                                <div className={styles.addItemRow}>
                                    <select
                                        aria-label="Tipo do item adicional"
                                        value={novoItemTipo}
                                        onChange={e => setNovoItemTipo(e.target.value)}
                                        className={styles.addItemSelect}
                                    >
                                        {TIPOS_ITEM.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="number"
                                        aria-label="Quantidade do item adicional"
                                        className={styles.addItemQtd}
                                        value={novaQtd}
                                        min={1}
                                        onChange={e => setNovaQtd(Number(e.target.value))}
                                    />
                                    <button
                                        type="button"
                                        className={styles.btnAdicionarItem}
                                        onClick={adicionarItemExtra}
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.btnCancelarAdd}
                                        onClick={() => setMostrarAddItem(false)}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            <div>
                                <label className={styles.obsLabel}>Observações</label>
                                <textarea
                                    className={styles.obsTextarea}
                                    placeholder="Registre aqui observações sobre este recebimento..."
                                    value={observacao}
                                    onChange={e => setObservacao(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFecharFooter} onClick={fecharModal}>Fechar</button>
                            <button type="button" className={styles.btnRecusar}>Recusar Recebimento</button>
                            <button type="button" className={styles.btnConfirmar}>Confirmar Recebimento</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
