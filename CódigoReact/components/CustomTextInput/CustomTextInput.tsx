import styles from "./CustomTextInput.module.css";

interface CustomTextInputProps {
    name: string;
    label: string;
    placeholder: string;
}

export const CustomTextInput = (props: CustomTextInputProps) => {
    return(
        <>
            <label className={styles.label} htmlFor={props.name} >{props.label}</label>
            <input className={styles.input} type="text" placeholder={props.placeholder} name={props.name} />
        </>
    )
}