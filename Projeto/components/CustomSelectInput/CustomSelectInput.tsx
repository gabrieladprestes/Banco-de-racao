import styles from "./CustomSelectInput.module.css";
import { ISelectInput } from "@/interfaces/selectInput.interface";

interface CustomSelectInputProps {
    forId: string;
    label: string;
    name: string;
    items: ISelectInput[];
}

export const CustomSelectInput = (props: CustomSelectInputProps) => {
    return(
        <>
            <label className={styles.label} htmlFor={props.forId} >{props.label}</label>
            <select className={styles.input} name={props.name} id={props.forId} >
                {props.items.map((option) => {
                    return(
                        <option key={option.id}>{option.text}</option>
                    )
                })}
            </select>
        </>
    )
}