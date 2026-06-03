import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";
import { CustomFilter } from "@/components/CustomFilter/CustomFilter";
import { CustomHistoryTable } from "@/components/CustomHistoryTable/CustomHistoryTable";
import { IHistoryTableTitle } from "@/interfaces/historyTableTitle.interface";
import { IHistoryTableData } from "@/interfaces/historyTableData.interface";

export default function HistoricoDoacoes() {
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

    const dadosTabela: IHistoryTableData[] = [
        {
            id: 1,
            column1: "Ração seca",
            column2: "02/10/2025",
            column3: "09/03/2030",
            column4: "0923094",
            column5: "3 pacotes",
            column6: "Marca Premiere",
            link: "../ReciboDoacao",
        },
        {
            id: 2,
            column1: "Ração úmida",
            column2: "12/11/2025",
            column3: "10/01/2027",
            column4: "8402735",
            column5: "2 pacotes",
            column6: "Marca Magnus",
            link: "../ReciboDoacao",
        },
        {
            id: 3,
            column1: "Ração seca",
            column2: "12/11/2025",
            column3: "07/02/2027",
            column4: "4628429",
            column5: "1 pacotes",
            column6: "Nenhuma",
            link: "../ReciboDoacao",
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