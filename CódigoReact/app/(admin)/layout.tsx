"use client";
import React, { useState } from "react";
import Image from "next/image";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    LayoutDashboard,
    Package,
    BarChart2,
    PackagePlus,
    PackageMinus,
    FileText,
    FolderOpen,
    Users,
    ClipboardList,
    UserPlus,
    Heart,
    FileSearch,
    Calendar,
    CalendarDays,
    CalendarCheck,
    ScrollText,
    LogOut,
} from "lucide-react";
import styles from "./layoutSidebar.module.css";
import logoDepartamento from "./img/logo_Bem-EstarAnimal.png";
import logoPrefeitura from "./img/logo_prefeituraVotorantim.png";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggle = (key: string) => setOpenMenu(openMenu === key ? null : key);

    return (
        <html>
            <body suppressHydrationWarning={true}>
                <button type="button" className={styles.hamburger} onClick={() => setSidebarOpen(true)}>☰</button>

                {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

                <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobileOpen : ''}`} id="sidebar">
                    <div className={styles.sidebarHeader}>
                        <div className={styles.logos}>
                            <Image src={logoDepartamento} alt="Departamento de Proteção e Bem-Estar Animal" className={styles.logo} />
                            <Image src={logoPrefeitura} alt="Prefeitura Municipal de Votorantim" className={styles.logo} />
                        </div>
                        <h2>Banco de Ração</h2>
                    </div>

                    <nav className={styles.sidebarNav}>
                        <a href="./DashboardAdmin" className={styles.submenuLink}>
                            <LayoutDashboard size={16} /> Dashboard
                        </a>

                        <div>
                            <button type="button" className={styles.menuBtn} onClick={() => toggle('estoque')}>
                                <Package size={16} /> Controle de Estoque
                            </button>
                            <div className={openMenu === 'estoque' ? styles.submenuOpen : styles.submenu}>
                                <a href="./ConsultaEstoque"><BarChart2 size={14} /> Consulta de Estoque</a>
                                <a href="./ReceberDoacao"><PackagePlus size={14} /> Recebimento de Doação</a>
                                <a href="./RetiradaDoacao"><PackageMinus size={14} /> Saída de Doação</a>
                                <span className={styles.submenuLinkDisabled}><FileText size={14} /> Relatórios de Estoque</span>
                                <a href="./CadastroProdutos"><FolderOpen size={14} /> Cadastro de Produtos</a>
                            </div>
                        </div>

                        <div>
                            <button type="button" className={styles.menuBtn} onClick={() => toggle('donatarios')}>
                                <Users size={16} /> Donatários
                            </button>
                            <div className={openMenu === 'donatarios' ? styles.submenuOpen : styles.submenu}>
                                <a href="./ConsultaDonatario"><ClipboardList size={14} /> Consulta de Donatários</a>
                                <span className={styles.submenuLinkDisabled}><UserPlus size={14} /> Cadastro de Donatário</span>
                            </div>
                        </div>

                        <div>
                            <button type="button" className={styles.menuBtn} onClick={() => toggle('doadores')}>
                                <Heart size={16} /> Doadores
                            </button>
                            <div className={openMenu === 'doadores' ? styles.submenuOpen : styles.submenu}>
                                <a href="./ConsultaDoador"><FileSearch size={14} /> Consulta de Doadores</a>
                                <span className={styles.submenuLinkDisabled}><UserPlus size={14} /> Cadastro de Doador</span>
                            </div>
                        </div>

                        <div>
                            <button type="button" className={styles.menuBtn} onClick={() => toggle('agendamentos')}>
                                <Calendar size={16} /> Agendamentos
                            </button>
                            <div className={openMenu === 'agendamentos' ? styles.submenuOpen : styles.submenu}>
                                <a href="./AgendamentosRetirada"><CalendarDays size={14} /> Calendário de Retiradas</a>
                                <a href="./GerenciarAgendas"><CalendarCheck size={14} /> Gerenciar Agendas</a>
                                <a href="./HistoricoRetiradasAdm"><ScrollText size={14} /> Histórico de Retiradas</a>
                            </div>
                        </div>
                    </nav>

                    <div className={styles.sidebarFooter}>
                        <a href="/login" className={styles.btnSair}>
                            <LogOut size={15} /> Sair
                        </a>
                    </div>
                </aside>

                <main className={styles.base}>
                    {children}
                </main>
            </body>
        </html>
    );
}
