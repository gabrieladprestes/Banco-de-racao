"use client";
import { useEffect, useState } from "react";
import styles from "./AdminHistoricoRetiradas.module.css";
import { IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminHistoricoDoacao } from "../../interfaces/adminHistoricoDoacao.interface";
import { buscarHistoricoRetiradas } from "../../services/retiradas.service";
import { buscarHistoricoDoacoes } from "../../services/doacoes.service";
import { formatarData } from "../../utils/dateUtils";
import { textoLoteFabricante } from "../../utils/estoqueUtils";

function resumoItens(itens: { nome: string; quantidade: number }[]) {
    return itens.map(i => `${i.nome} (${i.quantidade} kg)`).join(", ");
}

export const AdminHistoricoRetiradas = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");

    // Filtros — retiradas
    const [dataInicioR, setDataInicioR] = useState("");
    const [dataFimR, setDataFimR] = useState("");
    const [buscaR, setBuscaR] = useState("");
    const [retiradas, setRetiradas] = useState<IAdminHistoricoRetirada[]>([]);
    const [resultadoR, setResultadoR] = useState<IAdminHistoricoRetirada[]>([]);
    const [retiradaSelecionada, setRetiradaSelecionada] = useState<IAdminHistoricoRetirada | null>(null);

    // Filtros — doações
    const [dataInicioD, setDataInicioD] = useState("");
    const [dataFimD, setDataFimD] = useState("");
    const [buscaD, setBuscaD] = useState("");
    const [doacoes, setDoacoes] = useState<IAdminHistoricoDoacao[]>([]);
    const [resultadoD, setResultadoD] = useState<IAdminHistoricoDoacao[]>([]);
    const [doacaoSelecionada, setDoacaoSelecionada] = useState<IAdminHistoricoDoacao | null>(null);

    useEffect(() => {
        buscarHistoricoRetiradas().then(dados => {
            setRetiradas(dados);
            setResultadoR(dados);
        });
        buscarHistoricoDoacoes().then(dados => {
            setDoacoes(dados);
            setResultadoD(dados);
        });
    }, []);

    function filtrarRetiradas() {
        setResultadoR(retiradas.filter(r =>
            (!dataInicioR || r.dataRetirada >= dataInicioR) &&
            (!dataFimR    || r.dataRetirada <= dataFimR) &&
            (!buscaR      || r.donatario.toLowerCase().includes(buscaR.toLowerCase()))
        ));
    }

    function filtrarDoacoes() {
        setResultadoD(doacoes.filter(d =>
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
                                    <td>{formatarData(r.dataRetirada)}</td>
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
                                    <td>{formatarData(d.dataRecebimento)}</td>
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
                                <span><strong>Data:</strong> {formatarData(retiradaSelecionada.dataRetirada)}</span>
                                <span><strong>Responsável:</strong> {retiradaSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote interno</th>
                                        <th>Lote fabricante</th>
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
                                            <td>{textoLoteFabricante(item.loteFabricante)}</td>
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
                                <span><strong>Data:</strong> {formatarData(doacaoSelecionada.dataRecebimento)}</span>
                                <span><strong>Responsável:</strong> {doacaoSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote interno</th>
                                        <th>Lote fabricante</th>
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
                                            <td>{textoLoteFabricante(item.loteFabricante)}</td>
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
