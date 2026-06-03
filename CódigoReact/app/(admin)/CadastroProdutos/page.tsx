import styles from "./cadastroProdutos.module.css";
import { AdminCadastroProduto } from "@/components/AdminCadastroProduto/AdminCadastroProduto";

export default function CadastroProdutos() {
    return (
        <>
            <header className={styles.topbar}>
                <h1>Cadastro de Produtos</h1>
                <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">Olá, Administrador</span>
                    <a href="/login" className="btn btn-outline-secondary btn-sm">Sair</a>
                </div>
            </header>

            <div className={styles.content}>
                <AdminCadastroProduto />
            </div>

            <footer className={styles.footer}>
                Banco de Ração — Prefeitura de Votorantim
            </footer>
        </>
    );
}
