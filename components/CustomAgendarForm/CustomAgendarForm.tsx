import React from "react";
import styles from "./CustomAgendarForm.module.css";

interface CustomAgendarFormProps {
    children: React.ReactNode[];
};

export const CustomAgendarForm = (props: CustomAgendarFormProps) => {
    return(
        <form className={styles.form} >
            {...props.children}
        </form>
    )
}