import styles from "./consultaDoador.module.css";
import { AdminConsultaDoador } from "@/components/AdminConsultaDoador/AdminConsultaDoador";

export default function ConsultaDoador() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>📄 Consulta de Doadores</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminConsultaDoador />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
