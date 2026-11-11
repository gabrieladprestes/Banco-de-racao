import styles from "./CustomPetTextInput.module.css";
import { Field, ErrorMessage } from "formik";

interface CustomPetTextInputProps {
    name: string;
    label: string;
    placeholder: string;
}

export const CustomPetTextInput = (props: CustomPetTextInputProps) => {
    return(
        <>
            <label className={styles.label} htmlFor={props.name} >{props.label}</label>
            <Field 
                className={styles.input}
                type="text"
                placeholder={props.placeholder}
                name={props.name}
                id={props.name}
            />
            <ErrorMessage 
                name={props.name}
                component="span"
            />
        </>
    )
}