import styles from "./CustomTitle.module.css";

interface CustomTitleProps {
    title: String;
}

export const CustomTitle = (props: CustomTitleProps) => {
    return(
        <h1 style={styles} className={styles.custom_title} >{props.title}</h1>
    )
}