import styles from "./CustomPetSelectInput.module.css";
import { Field, ErrorMessage } from "formik"
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
            <Field
                as="select"
                className={styles.input}
                name={props.name}
                id={props.forId}
            >
                <option value="" disabled>Selecione</option>
                {props.options.map((option) => {
                    return(
                        <option key={option.id} value={option.value} >{option.text}</option>
                    )
                })}
            </Field>
            <ErrorMessage
                name={props.name}
                component="span"
            />
        </>
    )
}