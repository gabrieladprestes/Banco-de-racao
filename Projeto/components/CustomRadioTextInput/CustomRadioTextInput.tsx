import { useState } from "react";
import styles from "./CustomRadioTextInput.module.css";

interface CustomRadioTextInputProps {
    title: string;
    name: string;
    firstValue: string;
    firstLabel: string;
    secondValue: string;
    secondLabel: string;
    placeholder: string;
}

export const CustomRadioTextInput = (props: CustomRadioTextInputProps) => {
    const [firstSelected, setFirstSelected] = useState(false);
    const [inputValue, setInputValue] = useState("");

    return(
        <div>
            <span className={styles.radio_title} >{props.title}</span>
            <label className={styles.radio_label} >
                <input type="radio" name={props.name} value={props.firstValue} onChange={() => setFirstSelected(true)} />
                <span className={styles.styled_radio} ></span>
                {props.firstLabel}
            </label>

            <label className={styles.radio_label} >
                <input type="radio" name={props.name} value={props.secondValue} onChange={() => {setFirstSelected(false); setInputValue("");}} />
                <span className={styles.styled_radio} ></span>
                {props.secondLabel}
            </label>
            <input className={firstSelected ? styles.text_input : styles.disabled_text_input} type="text" placeholder={firstSelected ? props.placeholder : ""} disabled={firstSelected ? false : true} onChange={(text) => setInputValue(text.target.value)} value={firstSelected ? inputValue : ""} />
        </div>
    )
}