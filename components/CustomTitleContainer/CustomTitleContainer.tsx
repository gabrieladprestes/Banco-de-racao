import React from "react";
import styles from './CustomTitleContainer.module.css';

interface CustomTitleContainerProps {
    children: React.ReactNode[];
    title: String;
}

export const CustomTitleContainer = (props: CustomTitleContainerProps) => {
    return(
        <div style={styles} className={styles.custom_container} >
            <h1 style={styles} className={styles.custom_title} >{props.title}</h1>
            {...props.children}
        </div>
    )
}