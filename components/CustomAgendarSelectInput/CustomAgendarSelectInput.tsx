import styles from "./CustomAgendarSelectInput.module.css";
import { IAgendarSelectInput } from "@/interfaces/agendarSelectInput.interface";

interface CustomAgendarSelectInputProps {
    forId: string;
    label: string;
    name: string;
    options: IAgendarSelectInput[];
}

export const CustomAgendarSelectInput = (props: CustomAgendarSelectInputProps) => {
    return(
        <>
            <label htmlFor={props.forId} className={styles.label} >{props.label}</label>
            <select id={props.forId} name={props.name} className={styles.input} defaultValue="" required >
                <option value="" disabled >Selecione</option>
                {props.options.map((option) => {
                    return(
                        <option key={option.id} value={option.value} >{option.text}</option>
                    )
                })}
            </select>
        </>
    )
}