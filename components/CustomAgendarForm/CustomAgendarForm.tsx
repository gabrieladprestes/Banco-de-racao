import React from "react";
import styles from "./CustomAgendarForm.module.css";

interface CustomAgendarFormProps {
    children: React.ReactNode;
    onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
};

export const CustomAgendarForm = (props: CustomAgendarFormProps) => {
    return(
        <form className={styles.form} onSubmit={props.onSubmit} >
            {props.children}
        </form>
    )
}