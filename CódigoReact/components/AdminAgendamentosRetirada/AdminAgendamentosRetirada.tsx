"use client";
import { useState } from "react";
import styles from "./AdminAgendamentosRetirada.module.css";
import { IAdminAgendamento } from "../../interfaces/adminAgendamento.interface";
import { IAdminAgendaDoacao } from "../../interfaces/adminAgendaDoacao.interface";

const mockRetiradas: IAdminAgendamento[] = [
    { id: 1,  donatario: "Maria Silva",      item: "Ração de Cachorro", quantidade: 5, data: "2026-06-03", status: "Confirmado" },
    { id: 2,  donatario: "Carlos Souza",     item: "Ração de Gato",     quantidade: 2, data: "2026-06-03", status: "Confirmado" },
    { id: 3,  donatario: "Beatriz Campos",   item: "Ração de Cachorro", quantidade: 4, data: "2026-06-09", status: "Confirmado" },
    { id: 4,  donatario: "Sandra Alves",     item: "Ração de Cachorro", quantidade: 6, data: "2026-06-12", status: "Confirmado" },
    { id: 5,  donatario: "Lucas Barbosa",    item: "Ração de Gato",     quantidade: 5, data: "2026-06-19", status: "Confirmado" },
    { id: 6,  donatario: "Marcos Oliveira",  item: "Ração de Gato",     quantidade: 4, data: "2026-06-19", status: "Confirmado" },
    { id: 7,  donatario: "Ana Lima",         item: "Ração de Cachorro", quantidade: 3, data: "2026-06-24", status: "Confirmado" },
    { id: 8,  donatario: "João Pereira",     item: "Ração de Gato",     quantidade: 1, data: "2026-06-24", status: "Confirmado" },
    { id: 9,  donatario: "Camila Rocha",     item: "Ração de Cachorro", quantidade: 7, data: "2026-06-30", status: "Confirmado" },
    { id: 10, donatario: "Fernanda Costa",   item: "Ração de Gato",     quantidade: 2, data: "2026-06-30", status: "Confirmado" },
];

const mockDoacoes: IAdminAgendaDoacao[] = [
    { id: 1, doador: "João Pereira",          cpfCnpj: "987.654.321-00",     telefone: "(15) 98888-0002", item: "Ração de Cachorro", quantidade: 10, dataProposta: "2026-06-04", status: "aprovado" },
    { id: 2, doador: "Empresa Ração Certa",   cpfCnpj: "12.345.678/0001-99", telefone: "(15) 3333-0001",  item: "Ração de Gato",     quantidade: 20, dataProposta: "2026-06-04", status: "aprovado" },
    { id: 3, doador: "Maria Oliveira",        cpfCnpj: "111.222.333-44",     telefone: "(15) 97777-0003", item: "Ração de Cachorro", quantidade: 5,  dataProposta: "2026-06-10", status: "aprovado" },
    { id: 4, doador: "Supermercado BomPreço", cpfCnpj: "98.765.432/0001-11", telefone: "(15) 4444-0010",  item: "Ração de Gato",     quantidade: 30, dataProposta: "2026-06-17", status: "aprovado" },
    { id: 5, doador: "Carlos Mendes",         cpfCnpj: "222.333.444-55",     telefone: "(15) 96666-0005", item: "Ração de Cachorro", quantidade: 8,  dataProposta: "2026-06-17", status: "aprovado" },
    { id: 6, doador: "Pet Shop Amigo Fiel",   cpfCnpj: "55.444.333/0001-22", telefone: "(15) 2222-0020",  item: "Ração de Gato",     quantidade: 15, dataProposta: "2026-06-25", status: "aprovado" },
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const AdminAgendamentosRetirada = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");
    const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const nomeMes = hoje.toLocaleString("pt-BR", { month: "long", year: "numeric" });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    const dadosAtivos = aba === "retiradas" ? mockRetiradas : mockDoacoes;

    const diasComAgendamento = dadosAtivos
        .filter(a => {
            const d = new Date(aba === "retiradas"
                ? (a as IAdminAgendamento).data
                : (a as IAdminAgendaDoacao).dataProposta
            );
            return d.getFullYear() === ano && d.getMonth() === mes;
        })
        .map(a => new Date(aba === "retiradas"
            ? (a as IAdminAgendamento).data
            : (a as IAdminAgendaDoacao).dataProposta
        ).getDate());

    const celulas: (number | null)[] = [];
    for (let i = 0; i < primeiroDia; i++) {
        celulas.push(null);
    }
    for (let dia = 1; dia <= totalDias; dia++) {
        celulas.push(dia);
    }

    function getClasseDia(dia: number | null) {
        if (dia === null) return styles.calDiaVazio;
        if (dia === diaSelecionado) return styles.calDiaSelecionado;
        if (diasComAgendamento.includes(dia)) return styles.calDiaComAgendamento;
        return styles.calDia;
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
        ? mockRetiradas.filter(a => new Date(a.data).getDate() === diaSelecionado)
        : mockRetiradas;

    const doacoesExibidas = diaSelecionado
        ? mockDoacoes.filter(a => new Date(a.dataProposta).getDate() === diaSelecionado)
        : mockDoacoes;

    const tituloLista = diaSelecionado
        ? `${aba === "retiradas" ? "Retiradas" : "Doações"} do dia ${diaSelecionado}`
        : aba === "retiradas" ? "Todas as retiradas confirmadas" : "Todas as doações confirmadas";

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
                        <h3>📅 {nomeMes}</h3>
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
                                    {retiradaExibidas.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.donatario}</td>
                                            <td>{a.item}</td>
                                            <td>{a.quantidade}</td>
                                            <td>{new Date(a.data).toLocaleDateString("pt-BR")}</td>
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
                                    {doacoesExibidas.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.doador}</td>
                                            <td>{a.item}</td>
                                            <td>{a.quantidade}</td>
                                            <td>{new Date(a.dataProposta).toLocaleDateString("pt-BR")}</td>
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
