import styles from './CustomCardAdmin.module.css';

interface CustomCardAdminProps {
    link: string;
    icone: string;
    descricao: string

}

export const CustomCardAdmin = (props: CustomCardAdminProps) => {
    return (
        
        <div className="col-sm-6 col-md-3">
            <a href={props.link} className={styles.menuCard}>
                <p className={styles.menuIcon}>{props.icone}</p>
                <h3>{props.descricao}</h3>
            </a>
        </div>
    )
}