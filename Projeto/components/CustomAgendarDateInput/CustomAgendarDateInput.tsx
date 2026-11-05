import styles from "./CustomAgendarDateInput.module.css";
import { Field, ErrorMessage } from "formik";
import { getTodayDate } from "@/utils/dateUtils";

interface CustomAgendarDateInputProps {
    forId: string;
    label: string;
    name: string;
}

export const CustomAgendarDateInput = (props: CustomAgendarDateInputProps) => {
    const today = getTodayDate();

    return(
        <>
            <label htmlFor={props.forId} className={styles.label} >{props.label}</label>
            
            <Field 
                type="date" 
                id={props.forId} 
                name={props.name} 
                min={today} 
                required 
                className={styles.input} 
            />

            <ErrorMessage name={props.name} component="span " />
        </>
    )
}