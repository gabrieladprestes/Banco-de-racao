import { IAdminHistoricoItem } from "./adminHistoricoRetirada.interface";

export interface IAdminHistoricoDoacao {
    id: number;
    codigoAgendamento: string;
    doador: string;
    cpfCnpj: string;
    itens: IAdminHistoricoItem[];
    dataRecebimento: string;
    responsavel: string;
    semAgendamento?: boolean;       // recebida no balcão, sem agendamento
    doadorNaoCadastrado?: boolean;  // nome e documento anotados no balcão
}
