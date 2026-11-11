"use client";

import styles from "./CadastroAnimal.module.css";
import { CustomPetTextInput } from "@/components/CustomPetTextInput/CustomPetTextInput";
import { CustomPetSelectInput } from "@/components/CustomPetSelectInput/CustomPetSelectInput";
import { IPetSelectInput } from "@/interfaces/petSelectInput.interface";
import { CustomRadioContainer } from "@/components/CustomRadioContainer/CustomRadioContainer";
import { CustomRadioInput } from "@/components/CustomRadioInput/CustomRadioInput";
import { CustomRadioTextInput } from "@/components/CustomRadioTextInput/CustomRadioTextInput";
import { useState } from "react";
import { Formik, Form } from "formik";

export default function CadastroAnimal() {
  const url: string = "http://localhost:3010";

  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
   
  const idadeSelect: IPetSelectInput[] = [
    { id: 1, value: "filhote", text: "Filhote"}, 
    { id: 2, value: "adulto", text: "Adulto"}, 
    { id: 3, value: "senior", text: "Senior"}
  ];

  const porteSelect: IPetSelectInput[] = [
    { id: 1, value: "pequeno", text: "Pequeno"}, 
    { id: 2, value: "medio", text: "Médio"}, 
    { id: 3, value: "grande", text: "Grande"}
  ];

  const valoresIniciais = {
    nomePet: "",
    idadePet: "",
    portePet: "",
    especie: "",
    sexo: "",
    castrado: "",
    microchipado: "",
    microchipado_texto: ""
  };

  // const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
  //   const file = e.currentTarget.files?.[0];
  //   if (file) {
  //     const photoUrl = URL.createObjectURL(file);
  //     setPreviewFoto(photoUrl);

  //     setFieldValue("fotoPet", file)
  //   }
  // }

  return (
    <>
      <section style={styles} className={styles.container}>
        <div style={styles} className={styles.container_title} >
          <h1>Cadastre seu animalzinho!!</h1>
        </div>

        <Formik 
          initialValues={valoresIniciais} 
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            try {
              const formData = new FormData();
              formData.append("nome", values.nomePet);
              formData.append("idade", values.idadePet);
              formData.append("porte", values.portePet);
              formData.append("especie", values.especie);
              formData.append("sexo", values.sexo);
              formData.append("castrado", values.castrado);
              formData.append("microchipado", values.microchipado);
              formData.append("microchipado_detalhe", values.microchipado_texto);

              if (arquivoFoto) {
                formData.append("foto", arquivoFoto);
              }

              const response = await fetch(`${url}/cadastrarPet`, {
                method: "POST",
                body: formData
              })

              if (!response.ok) {
                throw new Error("Erro ao cadastrar animal.")
              }
              console.log(formData)
              alert("Animal cadastrado com sucesso!");
              resetForm();
              setArquivoFoto(null);
              setPreviewFoto(null);
            } catch (error) {
              console.error(error);
              alert("Erro ao cadastrar animal.");
            }
          }} 
        >
          {() => (
            <Form style={styles} id={styles.form}>
              <section style={styles} className={styles.section} >
                <div style={styles} className={styles.photo_container} >
                  <label style={styles} className={styles.pet_photo}>
                    <input 
                      type="file" 
                      accept="image/*"
                      style={styles}
                      id={styles.photo_input}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0]
                        if (!file) return;

                        setArquivoFoto(file);
                        setPreviewFoto(URL.createObjectURL(file));
                      }}
                    />
                    {previewFoto ? (
                      <img 
                        src={previewFoto}
                        alt="Preview da foto do pet"
                        style={styles}
                        className={styles.photo}
                      />
                    ): (
                      <span style={styles} className={styles.photo_image} >Foto do pet</span>
                    )}
                  </label>
                </div>

                <div style={styles} className={styles.inputs_container} >
                  <CustomPetTextInput 
                    name="nomePet" 
                    label="Nome" 
                    placeholder="Digite aqui" 
                  />
                  
                  <CustomPetSelectInput 
                    forId="idade" 
                    label="Idade" 
                    name="idadePet" 
                    options={idadeSelect} 
                  />
                  
                  <CustomPetSelectInput 
                    forId="porte" 
                    label="Porte" 
                    name="portePet" 
                    options={porteSelect} 
                  />
                </div>
              </section>
            

              <CustomRadioContainer>
                <CustomRadioInput 
                  title="Espécie" 
                  name="especie" 
                  firstValue="felino" 
                  firstLabel="Felino" 
                  secondValue="canino" 
                  secondLabel="Canino" 
                />
                <CustomRadioInput 
                  title="Sexo" 
                  name="sexo" 
                  firstValue="macho" 
                  firstLabel="Macho" 
                  secondValue="femea" 
                  secondLabel="Fêmea" 
                />
                <CustomRadioInput 
                  title="Castrado" 
                  name="castrado" 
                  firstValue="sim" 
                  firstLabel="Sim" 
                  secondValue="nao" 
                  secondLabel="Não" 
                />
                <CustomRadioTextInput 
                  title="Microchipado" 
                  name="microchipado" 
                  firstValue="sim" 
                  firstLabel="Sim" 
                  secondValue="nao" 
                  secondLabel="Não" 
                  placeholder="Digite aqui" 
                />
              </CustomRadioContainer>

              <button style={styles} id={styles.submit} type="submit">Cadastrar</button>
            </Form>
          )}
        </Formik>
      </section>
    </>
  );
}
