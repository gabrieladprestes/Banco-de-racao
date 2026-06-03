export interface IAdminPet {
    id: number;
    nome: string;
    especie: string;
}

export interface IAdminDonatario {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    foto?: string;
    pets: IAdminPet[];
}
