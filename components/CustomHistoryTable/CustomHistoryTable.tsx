import styles from "./CustomHistoryTable.module.css";
import { IHistoryTableTitle } from "@/interfaces/historyTableTitle.interface";
import { IHistoryTableData } from "@/interfaces/historyTableData.interface";

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
                        {props.columnsData.map((data) => {
                            return(
                                <tr key={data.id} >
                                    <td>{data.column1}</td>
                                    <td>{data.column2}</td>
                                    <td>{data.column3}</td>
                                    <td>{data.column4}</td>
                                    <td>{data.column5}</td>
                                    <td>{data.column6}</td>
                                    <td><a href={data.link} className={styles.table_btn} >Ver Recibo</a></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}