import styles from "./CustomAgendarSection.module.css";
import React from "react";

interface CustomAgendarSectionProps {
    children: React.ReactNode[];
}

export const CustomAgendarSection = (props: CustomAgendarSectionProps) => {
    return(
        <div className={styles.centralize}>
            <section className={styles.agendar_section} >
                {...props.children}
            </section>
        </div>
    )
}