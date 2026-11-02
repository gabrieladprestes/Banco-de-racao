import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";
import { CustomFilter } from "@/components/CustomFilter/CustomFilter";
import { CustomHistoryTable } from "@/components/CustomHistoryTable/CustomHistoryTable";
import { IHistoryTableTitle } from "@/interfaces/historyTableTitle.interface";
import { IHistoryTableData } from "@/interfaces/historyTableData.interface";

export default function HistoricoRetiradas() {

    const titulosTabela: IHistoryTableTitle[] = [
        {
            id: 1, 
            column1: "Tipo de Produto", 
            column2: "Data da Retirada", 
            column3: "Validade", 
            column4: "Lote", 
            column5: "Quantidade", 
            column6: "Observações"
        }]
    
    const dadosTabela: IHistoryTableData[] = [
        {
            id: 1,
            column1: "Petisco",
            column2: "04/18/2024",
            column3: "02/01/2025",
            column4: "48102104",
            column5: "1 pacote",
            column6: "Nenhuma",
            link: "../ReciboRetirada",
        },
        {
            id: 2,
            column1: "Ração úmida",
            column2: "12/11/2025",
            column3: "10/01/2027",
            column4: "8402735",
            column5: "2 pacotes",
            column6: "Marca Magnus",
            link: "../ReciboRetirada",
        },
        {
            id: 3,
            column1: "Ração úmida",
            column2: "11/21/2025",
            column3: "08/05/2028",
            column4: "82741024",
            column5: "2 pacotes",
            column6: "Nenhuma",
            link: "../ReciboRetirada",
        }]
    
    return(
        <CustomPaddingContainer>
            <CustomFilter />
            <CustomHistoryTable 
                tableTitle="Produtos Retirados"
                columnsTitle={titulosTabela}
                columnsData={dadosTabela}
            />
        </CustomPaddingContainer>
    )
}