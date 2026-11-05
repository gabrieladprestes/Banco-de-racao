export type EspeciePet = "Cachorro" | "Gato";
export type PortePet = "Pequeno" | "Médio" | "Grande";

export interface IAdminPet {
    id: number;
    nome: string;
    especie: EspeciePet;
    porte: PortePet;
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
