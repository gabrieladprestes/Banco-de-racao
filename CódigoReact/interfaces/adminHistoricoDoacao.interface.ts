import { IAdminHistoricoItem } from "./adminHistoricoRetirada.interface";

export interface IAdminHistoricoDoacao {
    id: number;
    codigoAgendamento: string;
    doador: string;
    cpfCnpj: string;
    itens: IAdminHistoricoItem[];
    dataRecebimento: string;
    responsavel: string;
}
