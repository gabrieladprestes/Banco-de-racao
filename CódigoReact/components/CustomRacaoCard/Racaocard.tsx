import styles from "./RacaoCard.module.css";

type RacaoCardProps = {
  imagem: string;
  peso: string;
  link?: string;
  textoBotao?: string;
};

export default function RacaoCard({
  imagem,
  peso,
  link = "../AgendarRetirada",
  textoBotao = "Agendar Retirada de Ração",
}: RacaoCardProps) {
  return (
    <div className={styles.racbolha}>
      <img src={imagem} className={styles.racicon} alt="ração" />
      <p>{peso}</p>
      <a href={link} className={styles.btnagend}>
        {textoBotao}
      </a>
    </div>
  );
}