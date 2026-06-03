import styles from "./saidaDoacao.module.css";
import { AdminSaidaDoacao } from "@/components/AdminSaidaDoacao/AdminSaidaDoacao";

export default function RetiradaDoacao() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📤 Saída de Doação</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminSaidaDoacao />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
