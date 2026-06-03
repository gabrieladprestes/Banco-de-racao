import styles from "./CustomHomeCard.module.css";

interface CustomHomeCardProps {
    image: string;
    title: string;
    link: string;
    alt: string;
}

export const CustomHomeCard = (props: CustomHomeCardProps) => {
    return(
        <a href={props.link} className={styles.linkcard}>
            <div style={styles} className={styles.image_container} >
                <img style={styles} className={styles.image}  src={props.image} alt={props.alt} />
                <p style={styles} className={styles.title} >{props.title}</p>
            </div>
        </a>
    )
}