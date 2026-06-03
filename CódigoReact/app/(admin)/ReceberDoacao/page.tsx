import styles from "./receberDoacao.module.css";
import { AdminReceberDoacao } from "@/components/AdminReceberDoacao/AdminReceberDoacao";

export default function RecebeDoacao() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📥 Recebimento de Doação</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminReceberDoacao />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
