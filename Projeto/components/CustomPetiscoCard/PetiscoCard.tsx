
import styles from "./PetiscoCard.module.css";

type PetiscoCardProps = {
  imagem: string;
  quant: string;
  disponivelRetirada?: string;
  agendamentoDisponivel?: boolean;
  link?: string;
  textoBotao?: string;
};

export default function PetiscoCard({
  imagem,
  quant,
  disponivelRetirada = "5 kg",
  agendamentoDisponivel = true,
  link = "../AgendarRetirada",
  textoBotao = "Agendar retirada de petiscos",
}: PetiscoCardProps) {
  return (
    <article className={styles.racbolha}>

      <div className={styles.imagemContainer}>
        <img
          src={imagem}
          className={styles.racicon}
          alt="Imagem dos petiscos disponíveis"
        />
      </div>

      <div className={styles.conteudo}>

        <div className={styles.estoque}>
          <span className={styles.label}>
            Estoque disponível no banco
          </span>

          <strong className={styles.quantidade}>
            {quant}
          </strong>
        </div>

        <div className={styles.retirada}>
          <div>
            <span className={styles.label}>
              Você pode retirar agora
            </span>

            <strong className={styles.limite}>
              {disponivelRetirada}
            </strong>
          </div>

          <span className={styles.status}>
            Limite por solicitação
          </span>
        </div>

        <div className={styles.agendamento}>
          <span
            className={
              agendamentoDisponivel
                ? styles.disponivel
                : styles.indisponivel
            }
          />

          <span>
            {agendamentoDisponivel
              ? "Agendamento disponível"
              : "Agendamento indisponível"}
          </span>
        </div>

        {agendamentoDisponivel ? (
          <a href={link} className={styles.btnagend}>
            {textoBotao}
          </a>
        ) : (
          <button
            className={styles.btnDesativado}
            disabled
          >
            Agendamento indisponível
          </button>
        )}

      </div>
    </article>
  );
}
