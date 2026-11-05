import styles from "./Ranking.module.css";
import diamante from "@/assets/diamante.png";
import gato from "@/assets/Mídia.png";

export default function Ranking() {
    return(
    <>
        <main>
            <section className={styles.sec_rank}>
                <div className={styles.bloco_rank}>
                    <h3>Você está no nível:</h3><br/>
                    <img className={styles.img_rank} src={diamante.src}/><br/>
                    <p>Diamante</p>
                </div>
                <div className={styles.bloco_stat}>
                    <h5>Acompanhe seu desempenho</h5>
                        <ul>
                            <li>Doações realizadas: 20</li>
                            <li>Quantidade de itens doados: 70 itens</li>
                            <li>Quantidade necessária para o próximo nível: 20 itens</li>
                        </ul>
                        <img className={styles.art_rank} src={gato.src}/>
                </div>

            </section>
        </main>
    
    </>);
}