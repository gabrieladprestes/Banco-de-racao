import styles from "./consultaEstoque.module.css";
import { AdminConsultaEstoque } from "@/components/AdminConsultaEstoque/AdminConsultaEstoque";

export default function ConsultaEstoque() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📊 Consulta de Estoque</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminConsultaEstoque />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
