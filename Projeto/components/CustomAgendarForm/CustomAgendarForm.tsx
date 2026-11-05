import React from "react";
import { Form } from "formik";
import styles from "./CustomAgendarForm.module.css";

interface CustomAgendarFormProps {
    children: React.ReactNode;
};

export const CustomAgendarForm = (props: CustomAgendarFormProps) => {
    return(
        <Form className={styles.form} >
            {props.children}
        </Form>
    )
}