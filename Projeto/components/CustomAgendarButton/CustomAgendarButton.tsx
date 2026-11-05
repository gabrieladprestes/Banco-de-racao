import styles from "./CustomAgendarButton.module.css";

interface CustomAgendarButtonProps {
    title: string;
}

export const CustomAgendarButton = (props: CustomAgendarButtonProps) => {
    return(
        <>
            <button type="submit" className={styles.button} >{props.title}</button>
        </>
    )
}