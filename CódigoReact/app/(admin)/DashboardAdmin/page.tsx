import styles from './dashboardAdmin.module.css';

const indicadores = [
    { icone: "📦", label: "Itens em Estoque",         valor: "11 registros",  sub: "230 kg no total",          cor: "teal"    },
    { icone: "⚠️", label: "Vencendo em 30 dias",      valor: "5 itens",       sub: "Requer atenção",            cor: "amarelo" },
    { icone: "📋", label: "Retiradas Pendentes",       valor: "2",             sub: "Aguardando aprovação",      cor: "teal"    },
    { icone: "📥", label: "Doações Agendadas",         valor: "3",             sub: "A confirmar esta semana",   cor: "teal"    },
];

const acessoRapido = [
    { icone: "📊", label: "Consulta de Estoque",     href: "./ConsultaEstoque"     },
    { icone: "📥", label: "Receber Doação",          href: "./ReceberDoacao"       },
    { icone: "📆", label: "Calendário de Retiradas", href: "./AgendamentosRetirada"},
    { icone: "🗂️", label: "Gerenciar Agendas",      href: "./GerenciarAgendas"    },
];

export default function DashboardAdmin() {
    return (
        <>
            <header className={styles.topbar}>
                <div className="d-flex align-items-center gap-3">
                    <h1 className="m-0">Painel Administrativo</h1>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>

                <section className={styles.secao}>
                    <h2 className={styles.secaoTitulo}>Indicadores</h2>
                    <div className={styles.indicadoresGrid}>
                        {indicadores.map((ind, i) => (
                            <div key={i} className={`${styles.indicadorCard} ${ind.cor === "amarelo" ? styles.indicadorAmarelo : styles.indicadorTeal}`}>
                                <div className={styles.indicadorIcone}>{ind.icone}</div>
                                <div className={styles.indicadorInfo}>
                                    <span className={styles.indicadorValor}>{ind.valor}</span>
                                    <span className={styles.indicadorLabel}>{ind.label}</span>
                                    <span className={styles.indicadorSub}>{ind.sub}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.secao}>
                    <h2 className={styles.secaoTitulo}>Acesso Rápido</h2>
                    <div className={styles.acessoGrid}>
                        {acessoRapido.map((item, i) => (
                            <a key={i} href={item.href} className={styles.menuCard}>
                                <div className={styles.menuIcon}>{item.icone}</div>
                                <h3>{item.label}</h3>
                            </a>
                        ))}
                    </div>
                </section>

            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
