import styles from "./CustomHistoryTable.module.css";
import { IHistoryTableTitle } from "@/interfaces/historyTableTitle.interface";
import { IHistoryTableData } from "@/interfaces/historyTableData.interface";
import { formatarData } from "@/utils/dateUtils";

interface CustomHistoryTableProps {
    tableTitle: string;
    columnsTitle: IHistoryTableTitle[];
    columnsData: IHistoryTableData[];
}

export const CustomHistoryTable = (props: CustomHistoryTableProps) => {
    return(
        <>
            <h5 className={styles.table_title} >{props.tableTitle}</h5>
            <div className={styles.table_container} >
                <table className={styles.table} >
                    <thead>
                        {props.columnsTitle.map((title) => {
                            return(
                                <tr key={title.id} >
                                    <th>{title.column1}</th>
                                    <th>{title.column2}</th>
                                    <th>{title.column3}</th>
                                    <th>{title.column4}</th>
                                    <th>{title.column5}</th>
                                    <th>{title.column6}</th>
                                    <th>&nbsp;</th>
                                </tr>
                            )
                        })}
                    </thead>
                    <tbody>
                        <tr className={styles.spacing_row} >
                            <td colSpan={7} ></td>
                        </tr>
                        {
                            props.columnsData.map((data) => {
                                console.log(props.columnsData);
                                let dataRetirada = data.Data_agendada.slice(0, 10);
                                dataRetirada = formatarData(dataRetirada);
    
                                let dataValidade = data.Validade.slice(0, 10);
                                dataValidade = formatarData(dataValidade);
    
                                return(
                                    <tr key={data.Id_agendamento} >
                                        <td>{data.Categoria}</td>
                                        <td>{dataRetirada}</td>
                                        <td>{dataValidade}</td>
                                        <td>{data.Lote}</td>
                                        <td>{data.Quantidade}</td>
                                        <td>Nenhuma</td>
                                        <td><a href="../ReciboRetirada" className={styles.table_btn} >Ver Recibo</a></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}