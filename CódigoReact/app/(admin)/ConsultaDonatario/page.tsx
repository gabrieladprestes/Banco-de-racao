import styles from "./consultaDonatario.module.css";
import { AdminConsultaDonatario } from "@/components/AdminConsultaDonatario/AdminConsultaDonatario";

export default function ConsultaDonatario() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📋 Consulta de Donatários</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminConsultaDonatario />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
