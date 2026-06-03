import styles from "./CustomRadioContainer.module.css";
import React from "react";

interface CustomRadioContainerProps {
    children: React.ReactNode[];
}

export const CustomRadioContainer = (props: CustomRadioContainerProps) => {
    return(
        <section style={styles} className={styles.radio_container} >
            {...props.children}
        </section>
    )
}