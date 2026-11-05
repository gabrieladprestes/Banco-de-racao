import styles from "./CustomAgendarAviso.module.css";

interface CustomAgendarAvisoProps {
    firstText: string;
    secondText?: boolean;
}

export const CustomAgendarAviso = (props: CustomAgendarAvisoProps) => {
    return(
        <div className={styles.aviso_container} >
            <p><strong>Aviso:</strong> {props.firstText}</p>
            <br/>

            {props.secondText ? <p><strong>Horário de funcinamento é das 9h até as 16h, de segunda a sexta. As doações e retiradas são feitas pessoalmente na unidade.</strong></p> : ""}
        </div>
    )
}