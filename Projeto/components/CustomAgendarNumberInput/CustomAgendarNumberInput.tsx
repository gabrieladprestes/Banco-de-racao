import styles from "./CustomAgendarNumberInput.module.css";
import { Field, ErrorMessage } from "formik";

interface CustomAgendarNumberInputProps {
    forId: string;
    label: string;
    name: string;
    placeholder: string;
}

export const CustomAgendarNumberInput = (props: CustomAgendarNumberInputProps) => {
    return(
        <>
            <label htmlFor={props.forId} className={styles.label} >{props.label}</label>
            <Field 
                type="number" 
                id={props.forId} 
                name={props.name} 
                placeholder={props.placeholder} 
                required 
                min="1" 
                className={styles.input} 
            />

            <ErrorMessage name={props.name} component="span" />
        </>
    )
}