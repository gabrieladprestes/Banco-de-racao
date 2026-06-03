"use client";
import styles from "./CadastroAnimal.module.css";
import { CustomPetTextInput } from "@/components/CustomPetTextInput/CustomPetTextInput";
import { CustomPetSelectInput } from "@/components/CustomPetSelectInput/CustomPetSelectInput";
import { IPetSelectInput } from "@/interfaces/petSelectInput.interface";
import { CustomRadioContainer } from "@/components/CustomRadioContainer/CustomRadioContainer";
import { CustomRadioInput } from "@/components/CustomRadioInput/CustomRadioInput";
import { CustomRadioTextInput } from "@/components/CustomRadioTextInput/CustomRadioTextInput";

export default function CadastroAnimal() {
  const idadeSelect: IPetSelectInput[] = [
    {
      id: 1, 
      value: "filhote", 
      text: "Filhote"
    }, 
    {
      id: 2, 
      value: "adulto", 
      text: "Adulto"
    }, 
    {
      id: 3, 
      value: "senior", 
      text: "Senior"
    }];

  const porteSelect: IPetSelectInput[] = [
    {
      id: 1, 
      value: "pequeno", 
      text: "Pequeno"
    }, 
    {
      id: 2, 
      value: "medio", 
      text: "Médio"
    }, 
    {
      id: 3, 
      value: "grande", 
      text: "Grande"
    }];

  return (
    <>
      <section style={styles} className={styles.container}>
        <div style={styles} className={styles.container_title} >
          <h1>Cadastre seu animalzinho!!</h1>
        </div>

        <section style={styles} className={styles.info_container}>
          <div style={styles} className={styles.photo_container} >
            <div style={styles} className={styles.pet_photo}>
              <p>Foto do pet</p>
            </div>
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

        <button style={styles} id={styles.submit}>Cadastrar</button>
      </section>
    </>
  );
}
