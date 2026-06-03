import styles from "./CustomButtonHome.module.css";

interface CustomButtonHomeProps {
    link: string;
    text: string;
}

export const CustomButtonHome = (props: CustomButtonHomeProps) => {
    return(
        <a href={props.link} style={styles} className={styles.button} >{props.text}</a>
    )
}