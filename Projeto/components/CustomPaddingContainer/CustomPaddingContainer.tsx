import React from "react";
import styles from "./CustomPaddingContainer.module.css";

interface CustomPaddingContainerProps {
    children: React.ReactNode[];
}

export const CustomPaddingContainer = (props: CustomPaddingContainerProps) => {
    return(
        <div style={styles} className={styles.container} >
            {...props.children}
        </div>
    )
}