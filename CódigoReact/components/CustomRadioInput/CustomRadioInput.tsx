import styles from "./CustomRadioInput.module.css";

interface CustomRadioInputProps {
    title: string;
    name: string;
    firstValue: string;
    firstLabel: string;
    secondValue: string;
    secondLabel: string;
}

export const CustomRadioInput = (props: CustomRadioInputProps) => {
    return(
        <div>
            <span style={styles} className={styles.radio_title} >{props.title}</span>
            <label style={styles} className={styles.radio_label} >
                <input type="radio" name={props.name} value={props.firstValue} />
                <span style={styles} className={styles.styled_radio} ></span>
                {props.firstLabel}
            </label>

            <label style={styles} className={styles.radio_label} >
                <input type="radio" name={props.name} value={props.secondValue} />
                <span style={styles} className={styles.styled_radio} ></span>
                {props.secondLabel}
            </label>
        </div>
    )
}