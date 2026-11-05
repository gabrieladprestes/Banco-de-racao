"use client";

import { Formik } from "formik";
import { CustomAgendarAviso } from "@/components/CustomAgendarAviso/CustomAgendarAviso";
import { CustomAgendarSection } from "@/components/CustomAgendarSection/CustomAgendarSection";
import { CustomAgendarForm } from "@/components/CustomAgendarForm/CustomAgendarForm";
import { CustomAgendarSelectInput } from "@/components/CustomAgendarSelectInput/CustomAgendarSelectInput";
import { CustomAgendarNumberInput } from "@/components/CustomAgendarNumberInput/CustomAgendarNumberInput";
import { CustomAgendarDateInput } from "@/components/CustomAgendarDateInput/CustomAgendarDateInput";
import { CustomAgendarButton } from "@/components/CustomAgendarButton/CustomAgendarButton";
import { IAgendarSelectInput } from "@/interfaces/agendarSelectInput.interface";

export default function AgendarDoacao() {
    const url: string = "http://localhost:3010";

    const dadosIniciais = {
        tipoProduto: "",
        quantidadeDoacao: "",
        dataDoacao: ""
    }

    const tipoProdutoOptions: IAgendarSelectInput[] = [
        { id: 1, value: "racao", text: "Ração "},
        { id: 2, value: "petisco", text: "Petisco"}
    ];

    return(
        <>
            <CustomAgendarAviso firstText="Aceitamos apenas suprimentos lacrados e com a validade e lote de fabricação aparente." secondText={true} />

            <CustomAgendarSection>
                <Formik
                    initialValues={dadosIniciais}
                    enableReinitialize
                    onSubmit={async (values, {resetForm}) => {
                        try {
                            const body = {
                                tipo: values.tipoProduto,
                                quantidade: values.quantidadeDoacao,
                                dataAgendada: values.dataDoacao
                            };

                            const response = await fetch(`${url}/agendarDoacao`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(body)
                            })

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error("Erro ao realizar o agendamento.");
                            }
                            if (data.MS == "OK"){
                                alert("Agendamento realizado com sucesso!");
                            }
                            resetForm();
                        } catch (error) {
                            console.error(error)
                            alert("Erro ao realizar o agendamento.")
                        }
                    }}
                >
                    <CustomAgendarForm>
                        <CustomAgendarSelectInput forId="tipo" label="Tipo de produto" name="tipoProduto" options={tipoProdutoOptions} />

                        <CustomAgendarNumberInput forId="quantidade" label="Quantidade" name="quantidadeDoacao" placeholder="Digite aqui" />
                        
                        <CustomAgendarDateInput forId="data" label="Selecione um dia" name="dataDoacao" />

                        <CustomAgendarButton title="Agendar Doação" />
                        
                    </CustomAgendarForm>
                </Formik>
                <></>
            </CustomAgendarSection>
        </>
    )
}