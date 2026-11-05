"use client";

import { Formik } from "formik"
import { CustomAgendarAviso } from "@/components/CustomAgendarAviso/CustomAgendarAviso"
import { CustomAgendarForm } from "@/components/CustomAgendarForm/CustomAgendarForm"
import { CustomAgendarSection } from "@/components/CustomAgendarSection/CustomAgendarSection"
import { CustomAgendarSelectInput } from "@/components/CustomAgendarSelectInput/CustomAgendarSelectInput"
import { CustomAgendarDateInput } from "@/components/CustomAgendarDateInput/CustomAgendarDateInput"
import { CustomAgendarButton } from "@/components/CustomAgendarButton/CustomAgendarButton"
import { IAgendarSelectInput } from "@/interfaces/agendarSelectInput.interface"

export default function AgendarRetirada() {
    const url: string = "http://localhost:3010"

    const dadosIniciais = {
        tipoProduto: "",
        portePet: "",
        dataRetirada: ""
    }

    const tipoProdutoOptions: IAgendarSelectInput[] = [
        { id: 1, value: "racao", text: "Ração"},
        { id: 2, value: "petisco", text: "Petisco"}
    ];

    const portePetOptions: IAgendarSelectInput[] = [
        { id: 1,value: "pequeno",text: "Porte pequeno"},
        { id: 2, value: "medio", text: "Porte médio"},
        { id: 3, value: "grande", text: "Porte grande"}
    ];

    return(
        <>
            <CustomAgendarAviso firstText=" Trabalhamos apenas com rações lacradas com a embalagem original, a quantidade que pode receber varia com a quantidade de pets na residência (sendo 1 saco por animal)." secondText={true} />

            <CustomAgendarSection>
                <Formik
                    initialValues={dadosIniciais}
                    enableReinitialize
                    onSubmit={async (values, {resetForm}) => {
                        try {
                            const body = {
                                tipo: values.tipoProduto,
                                porte: values.portePet,
                                dataAgendada: values.dataRetirada
                            }

                            const response = await fetch(`${url}/agendarRetirada`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(body)
                            })

                            console.log(body)

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error("Erro ao realizar o agendamento.");
                            }
                            if (data.MS == "OK"){
                                alert("Agendamento realizado com sucesso!");
                            }
                            resetForm();
                        } catch (error) {
                            console.error(error);
                            alert("Erro ao realizar o agendamento")
                        }
                    }}
                >
                    <CustomAgendarForm>
                        <CustomAgendarSelectInput forId="tipo" label="Tipo de produto" name="tipoProduto" options={tipoProdutoOptions} />

                        <CustomAgendarSelectInput forId="porte" label="Porte do pet" name="portePet" options={portePetOptions} />

                        <CustomAgendarDateInput forId="data" label="Selecione um dia" name="dataRetirada" />

                        <CustomAgendarAviso firstText="A quantidade e peso do produto que será retirado será analisado pressencialmente a partir do seu perfil em nossa unidade." secondText={false} />

                        <CustomAgendarButton title="Agendar retirada" />
                    </CustomAgendarForm>
                </Formik>
                <></>
            </CustomAgendarSection>
        </>
    )
}