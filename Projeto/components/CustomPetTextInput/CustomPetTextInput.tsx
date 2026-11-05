import styles from "./CustomPetTextInput.module.css";

interface CustomPetTextInputProps {
    name: string;
    label: string;
    placeholder: string;
}

export const CustomPetTextInput = (props: CustomPetTextInputProps) => {
    return(
        <>
            <label className={styles.label} htmlFor={props.name} >{props.label}</label>
            <input className={styles.input} type="text" placeholder={props.placeholder} name={props.name} required />
        </>
    )
}