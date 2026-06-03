import styles from "./historicoRetiradas.module.css";
import { AdminHistoricoRetiradas } from "@/components/AdminHistoricoRetiradas/AdminHistoricoRetiradas";

export default function HistoricoRetiradas() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📜 Histórico</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminHistoricoRetiradas />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
