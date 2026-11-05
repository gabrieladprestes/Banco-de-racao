'use client';

import { useState } from "react";
import styles from "./CustomFilter.module.css";
import { getTodayDate } from "@/utils/dateUtils";

export const CustomFilter = () => {
    const [filtro, setFiltro] = useState(false);
    const today = getTodayDate();

    return(
        <>
            <div className={styles.filter_btn_container}>
                <button className={styles.filter_btn} onClick={() => setFiltro(true)}>
                    <span className="material-symbols-rounded">filter_alt</span>
                </button>
            </div>

            {filtro && (
                <div className={styles.borrao} onClick={() => setFiltro(false)} >
                    <div className={styles.container_filtro} onClick={(e) => e.stopPropagation()}>
                        <h4>Filtros</h4>
                        <br/>
                        <div className={styles.campos}>
                            <div className={styles.side_fields}>
                                <select name="tipos" defaultValue="0" >
                                    <option value="0" disabled>Tipo produto</option>
                                    <option value="racao seca" >Ração seca</option>
                                    <option value="racao umida" >Ração úmida</option>
                                    <option value="petisco" >Petisco</option>
                                </select>
                                <label>Data</label>
                                <input type="date" name="data" max={today} />
                                <label>Validade</label>
                                <input type="date" name="validade" />
                            </div>
                            <div className={styles.side_fields}>
                                <input type="text" name="lote" placeholder="Lote" />
                                <input type="number" name="quantidade" min="1" placeholder="Quantidade" />
                                <input type="text" name="observacoes" placeholder="Observações" />
                            </div>
                        </div>
                        <div className={styles.btn_container}>
                            <button className={styles.aplicar_btn} onClick={() => setFiltro(false)}>Aplicar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}