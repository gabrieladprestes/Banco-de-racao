import styles from "./CustomPetSelectInput.module.css";
import { IPetSelectInput } from "@/interfaces/petSelectInput.interface";

interface CustomPetSelectInputProps {
    forId: string;
    label: string;
    name: string;
    options: IPetSelectInput[];
}

export const CustomPetSelectInput = (props: CustomPetSelectInputProps) => {
    return(
        <>
            <label className={styles.label} htmlFor={props.forId} >{props.label}</label>
            <select className={styles.input} name={props.name} id={props.forId} >
                {props.options.map((option) => {
                    return(
                        <option key={option.id} value={option.value} >{option.text}</option>
                    )
                })}
            </select>
        </>
    )
}