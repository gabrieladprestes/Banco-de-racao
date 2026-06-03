import styles from "./agendamentosRetirada.module.css";
import { AdminAgendamentosRetirada } from "@/components/AdminAgendamentosRetirada/AdminAgendamentosRetirada";

export default function AgendamentosRetirada() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📆 Calendário de Retiradas</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminAgendamentosRetirada />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
