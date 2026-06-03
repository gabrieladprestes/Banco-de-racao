"use client";
import { useState } from "react";
import styles from "./AdminHistoricoRetiradas.module.css";
import { IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminHistoricoDoacao } from "../../interfaces/adminHistoricoDoacao.interface";

const mockRetiradas: IAdminHistoricoRetirada[] = [
    { id: 1,  codigoAgendamento: "RET-2026-001", donatario: "Beatriz Lima",     cpf: "123.456.789-01", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L001", quantidade: 5  }], dataRetirada: "2026-01-15", responsavel: "Ana Paula"   },
    { id: 2,  codigoAgendamento: "RET-2026-002", donatario: "Marcos Souza",     cpf: "234.567.890-12", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       lote: "L004", quantidade: 3  }], dataRetirada: "2026-01-20", responsavel: "João Carlos"  },
    { id: 3,  codigoAgendamento: "RET-2026-003", donatario: "Luciana Ferreira", cpf: "345.678.901-23", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L001", quantidade: 8  }, { codigo: "RG001", nome: "Ração de Gato", tipo: "Ração", lote: "L004", quantidade: 2 }], dataRetirada: "2026-02-05", responsavel: "Ana Paula"   },
    { id: 4,  codigoAgendamento: "RET-2026-004", donatario: "Paulo Henrique",   cpf: "456.789.012-34", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L002", quantidade: 10 }], dataRetirada: "2026-02-18", responsavel: "João Carlos"  },
    { id: 5,  codigoAgendamento: "RET-2026-005", donatario: "Cristina Almeida", cpf: "567.890.123-45", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       lote: "L005", quantidade: 5  }], dataRetirada: "2026-03-02", responsavel: "Ana Paula"   },
    { id: 6,  codigoAgendamento: "RET-2026-006", donatario: "Diego Nascimento", cpf: "678.901.234-56", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L002", quantidade: 6  }, { codigo: "RG001", nome: "Ração de Gato", tipo: "Ração", lote: "L004", quantidade: 4 }], dataRetirada: "2026-03-15", responsavel: "João Carlos"  },
    { id: 7,  codigoAgendamento: "RET-2026-007", donatario: "Simone Martins",   cpf: "789.012.345-67", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L003", quantidade: 4  }], dataRetirada: "2026-03-28", responsavel: "Ana Paula"   },
    { id: 8,  codigoAgendamento: "RET-2026-008", donatario: "Tadeu Ribeiro",    cpf: "890.123.456-78", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       lote: "L005", quantidade: 7  }], dataRetirada: "2026-04-10", responsavel: "João Carlos"  },
    { id: 9,  codigoAgendamento: "RET-2026-009", donatario: "Beatriz Lima",     cpf: "123.456.789-01", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L001", quantidade: 5  }, { codigo: "PC001", nome: "Petisco Cachorro", tipo: "Petisco", lote: "P001", quantidade: 2 }], dataRetirada: "2026-04-22", responsavel: "Ana Paula"   },
    { id: 10, codigoAgendamento: "RET-2026-010", donatario: "Eduardo Campos",   cpf: "012.345.678-90", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       lote: "L002", quantidade: 9  }], dataRetirada: "2026-05-03", responsavel: "João Carlos"  },
    { id: 11, codigoAgendamento: "RET-2026-011", donatario: "Vanessa Rocha",    cpf: "901.234.567-89", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       lote: "L004", quantidade: 3  }, { codigo: "PG001", nome: "Petisco Gato", tipo: "Petisco", lote: "P002", quantidade: 2 }], dataRetirada: "2026-05-15", responsavel: "Ana Paula"   },
    { id: 12, codigoAgendamento: "RET-2026-012", donatario: "Paulo Henrique",   cpf: "456.789.012-34", itens: [{ codigo: "AP001", nome: "Antipulgas",        tipo: "Medicamento", lote: "M003", quantidade: 1  }], dataRetirada: "2026-05-28", responsavel: "João Carlos"  },
];

const mockDoacoes: IAdminHistoricoDoacao[] = [
    { id: 1,  codigoAgendamento: "AG-2026-001", doador: "João Pereira",                cpfCnpj: "987.654.321-00",     itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",   lote: "L001", quantidade: 10 }], dataRecebimento: "2026-01-10", responsavel: "Ana Paula"  },
    { id: 2,  codigoAgendamento: "AG-2026-002", doador: "Empresa Ração Certa Ltda",    cpfCnpj: "12.345.678/0001-99", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",   lote: "L004", quantidade: 20 }], dataRecebimento: "2026-01-25", responsavel: "João Carlos" },
    { id: 3,  codigoAgendamento: "AG-2026-003", doador: "Maria Oliveira",              cpfCnpj: "111.222.333-44",     itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",   lote: "L001", quantidade: 5  }], dataRecebimento: "2026-02-08", responsavel: "Ana Paula"  },
    { id: 4,  codigoAgendamento: "AG-2026-004", doador: "Carlos Mendes",               cpfCnpj: "222.333.444-55",     itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",   lote: "L005", quantidade: 8  }], dataRecebimento: "2026-02-20", responsavel: "João Carlos" },
    { id: 5,  codigoAgendamento: "AG-2026-005", doador: "PetShop Amigo Fiel Ltda",     cpfCnpj: "98.765.432/0001-10", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",   lote: "L002", quantidade: 50 }], dataRecebimento: "2026-03-05", responsavel: "Ana Paula"  },
    { id: 6,  codigoAgendamento: "AG-2026-006", doador: "Ana Paula Santos",            cpfCnpj: "333.444.555-66",     itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",   lote: "L004", quantidade: 12 }], dataRecebimento: "2026-03-18", responsavel: "João Carlos" },
    { id: 7,  codigoAgendamento: "AG-2026-007", doador: "Supermercado Bom Preço Ltda", cpfCnpj: "11.222.333/0001-44", itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",   lote: "L002", quantidade: 30 }, { codigo: "PC001", nome: "Petisco Cachorro", tipo: "Petisco", lote: "P001", quantidade: 8 }], dataRecebimento: "2026-04-02", responsavel: "Ana Paula"  },
    { id: 8,  codigoAgendamento: "AG-2026-008", doador: "Roberto Alves",               cpfCnpj: "444.555.666-77",     itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",   lote: "L005", quantidade: 6  }], dataRecebimento: "2026-04-15", responsavel: "João Carlos" },
    { id: 9,  codigoAgendamento: "AG-2026-009", doador: "Fernanda Costa",              cpfCnpj: "555.666.777-88",     itens: [{ codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",   lote: "L003", quantidade: 15 }], dataRecebimento: "2026-05-01", responsavel: "Ana Paula"  },
    { id: 10, codigoAgendamento: "AG-2026-010", doador: "Distribuidora AnimalVida SA", cpfCnpj: "55.444.333/0001-22", itens: [{ codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",   lote: "L004", quantidade: 40 }, { codigo: "PC001", nome: "Petisco Cachorro", tipo: "Petisco", lote: "P001", quantidade: 7 }], dataRecebimento: "2026-05-20", responsavel: "João Carlos" },
];

function resumoItens(itens: { nome: string; quantidade: number }[]) {
    return itens.map(i => `${i.nome} (${i.quantidade} kg)`).join(", ");
}

export const AdminHistoricoRetiradas = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");

    // Filtros — retiradas
    const [dataInicioR, setDataInicioR] = useState("");
    const [dataFimR, setDataFimR] = useState("");
    const [buscaR, setBuscaR] = useState("");
    const [resultadoR, setResultadoR] = useState<IAdminHistoricoRetirada[]>(mockRetiradas);
    const [retiradaSelecionada, setRetiradaSelecionada] = useState<IAdminHistoricoRetirada | null>(null);

    // Filtros — doações
    const [dataInicioD, setDataInicioD] = useState("");
    const [dataFimD, setDataFimD] = useState("");
    const [buscaD, setBuscaD] = useState("");
    const [resultadoD, setResultadoD] = useState<IAdminHistoricoDoacao[]>(mockDoacoes);
    const [doacaoSelecionada, setDoacaoSelecionada] = useState<IAdminHistoricoDoacao | null>(null);

    function filtrarRetiradas() {
        setResultadoR(mockRetiradas.filter(r =>
            (!dataInicioR || r.dataRetirada >= dataInicioR) &&
            (!dataFimR    || r.dataRetirada <= dataFimR) &&
            (!buscaR      || r.donatario.toLowerCase().includes(buscaR.toLowerCase()))
        ));
    }

    function filtrarDoacoes() {
        setResultadoD(mockDoacoes.filter(d =>
            (!dataInicioD || d.dataRecebimento >= dataInicioD) &&
            (!dataFimD    || d.dataRecebimento <= dataFimD) &&
            (!buscaD      || d.doador.toLowerCase().includes(buscaD.toLowerCase()))
        ));
    }

    return (
        <>
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${aba === "retiradas" ? styles.tabAtivo : ""}`}
                    onClick={() => setAba("retiradas")}
                >
                    📤 Retiradas
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${aba === "doacoes" ? styles.tabAtivo : ""}`}
                    onClick={() => setAba("doacoes")}
                >
                    📥 Doações Recebidas
                </button>
            </div>

            {aba === "retiradas" && (
                <>
                    <div className={styles.filtros}>
                        <div>
                            <label>Data início</label>
                            <input type="date" aria-label="Data início" value={dataInicioR} onChange={e => setDataInicioR(e.target.value)} />
                        </div>
                        <div>
                            <label>Data fim</label>
                            <input type="date" aria-label="Data fim" value={dataFimR} onChange={e => setDataFimR(e.target.value)} />
                        </div>
                        <div>
                            <label>Donatário</label>
                            <input
                                placeholder="Nome do donatário..."
                                value={buscaR}
                                onChange={e => setBuscaR(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && filtrarRetiradas()}
                            />
                        </div>
                        <button type="button" className={styles.btnBuscar} onClick={filtrarRetiradas}>Filtrar</button>
                    </div>

                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Cód. Agendamento</th>
                                <th>Donatário</th>
                                <th>CPF</th>
                                <th>Itens</th>
                                <th>Data</th>
                                <th>Responsável</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultadoR.map(r => (
                                <tr key={r.id}>
                                    <td>{r.codigoAgendamento}</td>
                                    <td>{r.donatario}</td>
                                    <td>{r.cpf}</td>
                                    <td className={styles.tdItens}>{resumoItens(r.itens)}</td>
                                    <td>{new Date(r.dataRetirada).toLocaleDateString("pt-BR")}</td>
                                    <td>{r.responsavel}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.btnVer}
                                            onClick={() => setRetiradaSelecionada(r)}
                                        >
                                            Ver itens
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {aba === "doacoes" && (
                <>
                    <div className={styles.filtros}>
                        <div>
                            <label>Data início</label>
                            <input type="date" aria-label="Data início" value={dataInicioD} onChange={e => setDataInicioD(e.target.value)} />
                        </div>
                        <div>
                            <label>Data fim</label>
                            <input type="date" aria-label="Data fim" value={dataFimD} onChange={e => setDataFimD(e.target.value)} />
                        </div>
                        <div>
                            <label>Doador</label>
                            <input
                                placeholder="Nome do doador..."
                                value={buscaD}
                                onChange={e => setBuscaD(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && filtrarDoacoes()}
                            />
                        </div>
                        <button type="button" className={styles.btnBuscar} onClick={filtrarDoacoes}>Filtrar</button>
                    </div>

                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Cód. Agendamento</th>
                                <th>Doador</th>
                                <th>CPF / CNPJ</th>
                                <th>Itens</th>
                                <th>Data</th>
                                <th>Responsável</th>
                                <th>Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resultadoD.map(d => (
                                <tr key={d.id}>
                                    <td>{d.codigoAgendamento}</td>
                                    <td>{d.doador}</td>
                                    <td>{d.cpfCnpj}</td>
                                    <td className={styles.tdItens}>{resumoItens(d.itens)}</td>
                                    <td>{new Date(d.dataRecebimento).toLocaleDateString("pt-BR")}</td>
                                    <td>{d.responsavel}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className={styles.btnVer}
                                            onClick={() => setDoacaoSelecionada(d)}
                                        >
                                            Ver itens
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            {/* Modal — retirada */}
            {retiradaSelecionada && (
                <div className={styles.backdrop} onClick={() => setRetiradaSelecionada(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalCodigo}>{retiradaSelecionada.codigoAgendamento}</span>
                                <h2>{retiradaSelecionada.donatario}</h2>
                            </div>
                            <button type="button" className={styles.btnFechar} onClick={() => setRetiradaSelecionada(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalInfo}>
                                <span><strong>CPF:</strong> {retiradaSelecionada.cpf}</span>
                                <span><strong>Data:</strong> {new Date(retiradaSelecionada.dataRetirada).toLocaleDateString("pt-BR")}</span>
                                <span><strong>Responsável:</strong> {retiradaSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote</th>
                                        <th>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retiradaSelecionada.itens.map((item, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.codPill}>{item.codigo}</span></td>
                                            <td>{item.nome}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.lote}</td>
                                            <td>{item.quantidade} kg</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — doação */}
            {doacaoSelecionada && (
                <div className={styles.backdrop} onClick={() => setDoacaoSelecionada(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalCodigo}>{doacaoSelecionada.codigoAgendamento}</span>
                                <h2>{doacaoSelecionada.doador}</h2>
                            </div>
                            <button type="button" className={styles.btnFechar} onClick={() => setDoacaoSelecionada(null)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalInfo}>
                                <span><strong>CPF / CNPJ:</strong> {doacaoSelecionada.cpfCnpj}</span>
                                <span><strong>Data:</strong> {new Date(doacaoSelecionada.dataRecebimento).toLocaleDateString("pt-BR")}</span>
                                <span><strong>Responsável:</strong> {doacaoSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote</th>
                                        <th>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doacaoSelecionada.itens.map((item, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.codPill}>{item.codigo}</span></td>
                                            <td>{item.nome}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.lote}</td>
                                            <td>{item.quantidade} kg</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
