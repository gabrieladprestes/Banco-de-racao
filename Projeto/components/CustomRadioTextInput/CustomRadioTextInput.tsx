import { useState } from "react";
import styles from "./CustomRadioTextInput.module.css";
import { Field, useFormikContext } from "formik"

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
    const { values, setFieldValue } = useFormikContext<any>();
    const isFirstSelected = values[props.name] === props.firstValue;
    // const [firstSelected, setFirstSelected] = useState(false);
    // const [inputValue, setInputValue] = useState("");

    return(
        <div>
            <span className={styles.radio_title} >{props.title}</span>
            <label className={styles.radio_label} >
                <Field type="radio" name={props.name} value={props.firstValue} />
                <span className={styles.styled_radio} ></span>
                {props.firstLabel}
            </label>

            <label className={styles.radio_label} >
                <Field type="radio" name={props.name} value={props.secondValue} onChange={() => {setFieldValue(props.name, props.secondValue); setFieldValue(`${props.name}_texto`, "");}} />
                <span className={styles.styled_radio} ></span>
                {props.secondLabel}
            </label>
            <input className={isFirstSelected ? styles.text_input : styles.disabled_text_input} type="text" placeholder={isFirstSelected ? props.placeholder : ""} disabled={!isFirstSelected} />
        </div>
    )
}