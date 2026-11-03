"use client";

import { CustomAgendarAviso } from "@/components/CustomAgendarAviso/CustomAgendarAviso";
import { CustomAgendarSection } from "@/components/CustomAgendarSection/CustomAgendarSection";
import { CustomAgendarForm } from "@/components/CustomAgendarForm/CustomAgendarForm";
import { CustomAgendarSelectInput } from "@/components/CustomAgendarSelectInput/CustomAgendarSelectInput";
import { CustomAgendarNumberInput } from "@/components/CustomAgendarNumberInput/CustomAgendarNumberInput";
import { CustomAgendarDateInput } from "@/components/CustomAgendarDateInput/CustomAgendarDateInput";
import { CustomAgendarButton } from "@/components/CustomAgendarButton/CustomAgendarButton";
import { IAgendarSelectInput } from "@/interfaces/agendarSelectInput.interface";
import { useState } from "react";

export default function AgendarDoacao() {
    const [formData]
    const tipoProdutoOptions: IAgendarSelectInput[] = [
        {
            id: 1,
            value: "racao",
            text: "Ração ",
        },
        {
            id: 2,
            value: "petisco",
            text: "Petisco",
        }];

    return(
        <>
            <CustomAgendarAviso firstText="Aceitamos apenas suprimentos lacrados e com a validade e lote de fabricação aparente." secondText={true} />

            <CustomAgendarSection>
                <CustomAgendarForm>
                    <CustomAgendarSelectInput forId="tipo" label="Tipo de produto" name="tipoProduto" options={tipoProdutoOptions} />

                    <CustomAgendarNumberInput forId="quantidade" label="Quantidade" name="quantidadeDoacao" placeholder="Digite aqui" />
                    
                    <CustomAgendarDateInput forId="data" label="Selecione um dia" name="dataDoacao" />

                    <CustomAgendarButton title="Agendar Doação" />
                    
                </CustomAgendarForm>
                <></>
            </CustomAgendarSection>
        </>
    )
}