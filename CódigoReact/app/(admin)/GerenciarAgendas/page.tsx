import styles from "./gerenciarAgendas.module.css";
import { AdminGerenciarAgendas } from "@/components/AdminGerenciarAgendas/AdminGerenciarAgendas";

export default function GerenciarAgendas() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>🗂️ Gerenciar Agendas</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminGerenciarAgendas />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
