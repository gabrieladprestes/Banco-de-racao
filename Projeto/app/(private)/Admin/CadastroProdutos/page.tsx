import styles from "./cadastroProdutos.module.css";
import { AdminCadastroProduto } from "@/components/AdminCadastroProduto/AdminCadastroProduto";

export default function CadastroProdutos() {
    return (
        <div className={styles.centralizado}>
            <AdminCadastroProduto />
        </div>
    );
}
