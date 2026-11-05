"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./AdminDashboard.module.css";
import { IAdminResumoDashboard, buscarResumoDashboard } from "../../services/dashboard.service";
import { formatarData, getTodayDate } from "../../utils/dateUtils";

const acessoRapido = [
    { icone: "📊", label: "Consulta de Estoque",     href: "/Admin/ConsultaEstoque"      },
    { icone: "📥", label: "Receber Doação",          href: "/Admin/ReceberDoacao"        },
    { icone: "📆", label: "Calendário de Retiradas", href: "/Admin/AgendamentosRetirada" },
    { icone: "🗂️", label: "Gerenciar Agendas",       href: "/Admin/GerenciarAgendas"     },
];

type Cor = "teal" | "amarelo" | "vermelho" | "verde";

interface IIndicador {
    icone: string;
    label: string;
    valor: string;
    sub: string;
    cor: Cor;
    href: string;
}

const plural = (n: number, singular: string, pluralTexto: string) => `${n} ${n === 1 ? singular : pluralTexto}`;

function montarIndicadores(r: IAdminResumoDashboard): IIndicador[] {
    const nomesMinimo = r.abaixoMinimo.map(a => `${a.nome} (${a.disponivel}/${a.minimo} ${a.unidade})`).join(", ");
    return [
        {
            icone: "📦", label: "Estoque disponível", cor: "teal", href: "/Admin/ConsultaEstoque",
            valor: `${r.disponivelKg} kg · ${r.disponivelUn} un`,
            sub: `${plural(r.produtosComSaldo, "produto com saldo", "produtos com saldo")}`,
        },
        {
            icone: "⏳", label: "Validade", href: "/Admin/ConsultaEstoque",
            cor: r.lotesVencidosComSaldo > 0 ? "vermelho" : r.lotesVencendo > 0 ? "amarelo" : "verde",
            valor: plural(r.lotesVencendo, "lote vence em 30 dias", "lotes vencem em 30 dias"),
            sub: r.lotesVencidosComSaldo > 0
                ? `${plural(r.lotesVencidosComSaldo, "lote vencido", "lotes vencidos")} com saldo (${r.saldoVencido}) — descartar`
                : "Nenhum lote vencido com saldo",
        },
        {
            icone: "⚠️", label: "Abaixo do estoque mínimo", href: "/Admin/ConsultaEstoque",
            cor: r.abaixoMinimo.length > 0 ? "vermelho" : "verde",
            valor: plural(r.abaixoMinimo.length, "produto", "produtos"),
            sub: r.abaixoMinimo.length > 0 ? nomesMinimo : "Todos acima do mínimo",
        },
        {
            icone: "📋", label: "Retiradas pendentes", href: "/Admin/GerenciarAgendas",
            cor: r.retiradasPendentes > 0 ? "amarelo" : "verde",
            valor: String(r.retiradasPendentes),
            sub: "Aguardando aprovação",
        },
        {
            icone: "📥", label: "Doações a receber", cor: "teal", href: "/Admin/ReceberDoacao",
            valor: String(r.doacoesAReceber),
            sub: "Aprovadas, aguardando recebimento",
        },
    ];
}

const classeCor: Record<Cor, string> = {
    teal: styles.indicadorTeal,
    amarelo: styles.indicadorAmarelo,
    vermelho: styles.indicadorVermelho,
    verde: styles.indicadorVerde,
};

export function AdminDashboard() {
    const [resumo, setResumo] = useState<IAdminResumoDashboard | null>(null);

    useEffect(() => {
        buscarResumoDashboard().then(setResumo);
    }, []);

    const hoje = getTodayDate();
    const atrasados = resumo?.agenda.filter(c => c.atrasado) ?? [];
    const proximos = resumo?.agenda.filter(c => !c.atrasado) ?? [];

    return (
        <>
            <section className={styles.secao}>
                <h2 className={styles.secaoTitulo}>Indicadores</h2>
                {!resumo ? (
                    <p className={styles.carregando}>Carregando…</p>
                ) : (
                    <div className={styles.indicadoresGrid}>
                        {montarIndicadores(resumo).map(ind => (
                            <Link key={ind.label} href={ind.href} className={`${styles.indicadorCard} ${classeCor[ind.cor]}`}>
                                <div className={styles.indicadorIcone}>{ind.icone}</div>
                                <div className={styles.indicadorInfo}>
                                    <span className={styles.indicadorValor}>{ind.valor}</span>
                                    <span className={styles.indicadorLabel}>{ind.label}</span>
                                    <span className={styles.indicadorSub}>{ind.sub}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {resumo && (
                <section className={styles.secao}>
                    <h2 className={styles.secaoTitulo}>Agenda</h2>
                    {resumo.agenda.length === 0 ? (
                        <p className={styles.vazio}>Nenhuma retirada ou doação atrasada ou nos próximos 7 dias.</p>
                    ) : (
                        <table className={styles.agenda}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Itens</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {atrasados.length > 0 && (
                                    <tr className={styles.grupo}><td colSpan={6}>Atrasados ({atrasados.length})</td></tr>
                                )}
                                {atrasados.map(c => (
                                    <tr key={c.chave} className={styles.linhaAtrasada}>
                                        <td>{formatarData(c.data)}</td>
                                        <td>{c.tipo}</td>
                                        <td>{c.codigo}</td>
                                        <td>{c.nome}</td>
                                        <td>{c.itens}</td>
                                        <td><Link href={c.href} className={styles.linkAbrir}>Abrir</Link></td>
                                    </tr>
                                ))}
                                {proximos.length > 0 && (
                                    <tr className={styles.grupo}><td colSpan={6}>Próximos 7 dias ({proximos.length})</td></tr>
                                )}
                                {proximos.map(c => (
                                    <tr key={c.chave}>
                                        <td>{c.data === hoje ? <strong>Hoje</strong> : formatarData(c.data)}</td>
                                        <td>{c.tipo}</td>
                                        <td>{c.codigo}</td>
                                        <td>{c.nome}</td>
                                        <td>{c.itens}</td>
                                        <td><Link href={c.href} className={styles.linkAbrir}>Abrir</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            <section className={styles.secao}>
                <h2 className={styles.secaoTitulo}>Acesso Rápido</h2>
                <div className={styles.acessoGrid}>
                    {acessoRapido.map(item => (
                        <Link key={item.href} href={item.href} className={styles.menuCard}>
                            <div className={styles.menuIcon}>{item.icone}</div>
                            <h3>{item.label}</h3>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
