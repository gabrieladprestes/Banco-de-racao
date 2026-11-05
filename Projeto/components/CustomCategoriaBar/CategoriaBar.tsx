
import styles from "./CategoriaBar.module.css";

type Categoria = "racao" | "petisco";

type CategoriaBarProps = {
  categoriaAtiva: Categoria;
  onChange: (categoria: Categoria) => void;
};

export default function CategoriaBar({
  categoriaAtiva,
  onChange,
}: CategoriaBarProps) {
  return (
    <nav className={styles.barra}>
      <button
        className={`${styles.opcao} ${
          categoriaAtiva === "racao" ? styles.ativa : ""
        }`}
        onClick={() => onChange("racao")}
      >
        Rações
      </button>

      <button
        className={`${styles.opcao} ${
          categoriaAtiva === "petisco" ? styles.ativa : ""
        }`}
        onClick={() => onChange("petisco")}
      >
        Petiscos
      </button>
    </nav>
  );
}
