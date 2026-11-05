import styles from "./CustomAgendarSelectInput.module.css";
import { Field, ErrorMessage } from "formik";
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
            <Field as="select" id={props.forId} name={props.name} className={styles.input} required >
                    <option value="" disabled >Selecione</option>
                    {props.options.map((option) => (
                        <option key={option.id} value={option.value} >{option.text}</option>
                    ))}
            </Field>
            <ErrorMessage name={props.name} component="span" />
        </>
    )
}