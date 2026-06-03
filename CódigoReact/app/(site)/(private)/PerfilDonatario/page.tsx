import styles from "./PerfilDonatario.module.css"
import perfil from "@/assets/profile_image.png"
import icone from "@/assets/icone.png"

export default function PerfilDonatario() {
    // Página sem componetizar, pois não pertence a este grupo, estamos usando ela apenas
    // para mostrar a lógica que o site vai seguir
    return(
        <>
            <div className={styles.container_profile} >
                <div className={styles.profile_card} >
                    <img className={styles.profile_image} src={perfil.src} />
                    <img className={styles.profile_icon} src={icone.src} />
                </div>
                <div>

                </div>
            </div>
            <div className={styles.container_row_profile}>
                <div className={styles.info_profile}>
                    <ul>
                        <li>Nome:</li>
                        <li>CPF:</li>
                        <li>Telefone:</li>
                        <li>Email:</li>
                        <li>CEP:</li>
                    </ul>
                    <img className={styles.info_icon} src={icone.src} />
                </div>
                <div className={styles.buttons_profile}>
                    <a href="../HistoricoRetiradas">Histórico de Retiradas</a>
                    <a href="../CadastroAnimal">Cadastrar Pet</a>
                    <a href="../CatalagoRacao">Nova Retirada</a>
                </div>
            </div>
        </>
    )
}