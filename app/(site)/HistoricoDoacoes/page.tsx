"use client";

import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";
import { CustomFilter } from "@/components/CustomFilter/CustomFilter";
import { CustomHistoryTable } from "@/components/CustomHistoryTable/CustomHistoryTable";
import { IHistoryTableTitle } from "@/interfaces/historyTableTitle.interface";
import { IHistoryTableData } from "@/interfaces/historyTableData.interface";
import { useState, useEffect } from "react";

export default function HistoricoDoacoes() {
    const [dadosTabela, setDadosTabela] = useState<IHistoryTableData[]>([]);
    const url: string = "http://localhost:3010";

    async function carregarDados(url: string) {
        try {
            const caminho = url + "/doacao";
            await fetch(caminho)
                .then((resp) => resp.json())
                .then((data) => setDadosTabela(data))
        } catch (e) {
            console.log(`erro:${e}`);
        }
    }

    useEffect(() => {
        carregarDados(url);
    }, []);

    const titulosTabela: IHistoryTableTitle[] = [
        {
            id: 1, 
            column1: "Tipo de Produto", 
            column2: "Data da Doação", 
            column3: "Validade", 
            column4: "Lote", 
            column5: "Quantidade", 
            column6: "Observações"
        }]

    return (
        <CustomPaddingContainer>
            <CustomFilter/>
            <CustomHistoryTable 
                tableTitle="Doações Realizadas" 
                columnsTitle={titulosTabela} 
                columnsData={dadosTabela} 
            />
        </CustomPaddingContainer>
    )
}