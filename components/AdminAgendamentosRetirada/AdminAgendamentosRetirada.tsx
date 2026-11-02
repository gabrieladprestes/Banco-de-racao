"use client";
import { useEffect, useState } from "react";
import styles from "./AdminAgendamentosRetirada.module.css";
import { IAdminAgendamento } from "../../interfaces/adminAgendamento.interface";
import { IAdminAgendaDoacao } from "../../interfaces/adminAgendaDoacao.interface";
import { buscarRetiradasAgendadas } from "../../services/retiradas.service";
import { buscarDoacoesConfirmadas } from "../../services/doacoes.service";
import { formatarData, getTodayDate } from "../../utils/dateUtils";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const AdminAgendamentosRetirada = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
    const [retiradas, setRetiradas] = useState<IAdminAgendamento[]>([]);
    const [doacoes, setDoacoes] = useState<IAdminAgendaDoacao[]>([]);

    useEffect(() => {
        buscarRetiradasAgendadas().then(setRetiradas);
        buscarDoacoesConfirmadas().then(setDoacoes);
    }, []);

    // Mês exibido no calendário (começa no mês atual; as setas avançam e voltam)
    const [deslocamentoMes, setDeslocamentoMes] = useState(0);
    const hoje = getTodayDate();
    const base = new Date();
    const exibido = new Date(base.getFullYear(), base.getMonth() + deslocamentoMes, 1);
    const ano = exibido.getFullYear();
    const mes = exibido.getMonth();
    const nomeMes = exibido.toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    // Datas são texto "AAAA-MM-DD": comparamos pelo texto para não sofrer com fuso horário
    const mesExibido = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    const dataDoDia = (dia: number) => `${mesExibido}-${String(dia).padStart(2, "0")}`;

    const datasAtivas = aba === "retiradas"
        ? retiradas.map(a => a.data)
        : doacoes.map(a => a.dataProposta);

    const diasComAgendamento = datasAtivas
        .filter(d => d.slice(0, 7) === mesExibido)
        .map(d => Number(d.slice(8)));

    function mudarMes(delta: number) {
        setDeslocamentoMes(deslocamentoMes + delta);
        setDiaSelecionado(null);
    }

    const celulas: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) {
        celulas.push(null);
    }
    for (let dia = 1; dia <= totalDias; dia++) {
        celulas.push(dia);
    }

    function getClasseDia(dia: number | null) {
        if (dia === null) return styles.calDiaVazio;
        // O dia de hoje ganha um contorno, além da cor normal
        const marcaHoje = dataDoDia(dia) === hoje ? ` ${styles.calHoje}` : "";
        if (dia === diaSelecionado) return styles.calDiaSelecionado + marcaHoje;
        if (diasComAgendamento.includes(dia)) return styles.calDiaComAgendamento + marcaHoje;
        return styles.calDia + marcaHoje;
    }

    function clicarDia(dia: number) {
        if (!diasComAgendamento.includes(dia)) return;
        setDiaSelecionado(diaSelecionado === dia ? null : dia);
    }

    function trocarAba(novaAba: "retiradas" | "doacoes") {
        setAba(novaAba);
        setDiaSelecionado(null);
    }

    const retiradaExibidas = diaSelecionado
        ? retiradas.filter(a => a.data === dataDoDia(diaSelecionado))
        : retiradas.filter(a => a.data.slice(0, 7) === mesExibido);

    const doacoesExibidas = diaSelecionado
        ? doacoes.filter(a => a.dataProposta === dataDoDia(diaSelecionado))
        : doacoes.filter(a => a.dataProposta.slice(0, 7) === mesExibido);

    const tituloLista = diaSelecionado
        ? `${aba === "retiradas" ? "Retiradas" : "Doações"} do dia ${diaSelecionado}`
        : `${aba === "retiradas" ? "Retiradas" : "Doações"} confirmadas em ${nomeMes}`;

    return (
        <div>
            <div className={styles.abas}>
                <button
                    type="button"
                    className={aba === "retiradas" ? styles.abaAtiva : styles.aba}
                    onClick={() => trocarAba("retiradas")}
                >
                    Retiradas (Donatário)
                </button>
                <button
                    type="button"
                    className={aba === "doacoes" ? styles.abaAtiva : styles.aba}
                    onClick={() => trocarAba("doacoes")}
                >
                    Doações (Doador)
                </button>
            </div>

            <div className={styles.grid}>
                <div className={styles.calendario}>
                    <div className={styles.calHeader}>
                        <button type="button" className={styles.btnMes} aria-label="Mês anterior" onClick={() => mudarMes(-1)}>‹</button>
                        <h3>📅 {nomeMes}</h3>
                        <button type="button" className={styles.btnMes} aria-label="Próximo mês" onClick={() => mudarMes(1)}>›</button>
                    </div>
                    <div className={styles.calGrid}>
                        {DIAS_SEMANA.map(d => (
                            <div key={d} className={styles.calDiaSemana}>{d}</div>
                        ))}
                        {celulas.map((dia, i) => (
                            <div
                                key={i}
                                className={getClasseDia(dia)}
                                onClick={() => dia !== null && clicarDia(dia)}
                            >
                                {dia}
                            </div>
                        ))}
                    </div>
                    {diaSelecionado && (
                        <button
                            type="button"
                            className={styles.btnLimparFiltro}
                            onClick={() => setDiaSelecionado(null)}
                        >
                            Ver todos
                        </button>
                    )}
                </div>

                <div className={styles.tabela}>
                    <h3>{tituloLista}</h3>
                    <div className={styles.tabelaScroll}>
                        {aba === "retiradas" && (
                            <table className={styles.tabelaInterna}>
                                <thead>
                                    <tr>
                                        <th>Donatário</th>
                                        <th>Item</th>
                                        <th>Qtd</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retiradaExibidas.length === 0 && (
                                        <tr><td colSpan={4} className={styles.semResultados}>Nenhuma retirada neste mês.</td></tr>
                                    )}
                                    {retiradaExibidas.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.donatario}</td>
                                            <td>{a.item}</td>
                                            <td>{a.quantidade}</td>
                                            <td>{formatarData(a.data)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {aba === "doacoes" && (
                            <table className={styles.tabelaInterna}>
                                <thead>
                                    <tr>
                                        <th>Doador</th>
                                        <th>Item</th>
                                        <th>Qtd</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doacoesExibidas.length === 0 && (
                                        <tr><td colSpan={4} className={styles.semResultados}>Nenhuma doação neste mês.</td></tr>
                                    )}
                                    {doacoesExibidas.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.doador}</td>
                                            <td>{a.item}</td>
                                            <td>{a.quantidade}</td>
                                            <td>{formatarData(a.dataProposta)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
