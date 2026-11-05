
'use client';

import { useState } from "react";
import RacaoCard from "@/components/CustomRacaoCard/Racaocard";
import styles from "./CatalagoRacao.module.css";
import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";
import racaoAzul from "@/assets/racaoazul.png";
import CategoriaBar from "@/components/CustomCategoriaBar/CategoriaBar";
import PetiscoCard from "@/components/CustomPetiscoCard/PetiscoCard";
import GatoSafado from "@/assets/Mídia.png";

export default function CatalogoRacao() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<
    "racao" | "petisco"
  >("racao");

  return (
    <main>
      {/* informações de cima */}
        <section className={styles.cabecalho}>
          <h1 className={styles.titulo}>Catálogo de produtos</h1>

          <div className={styles.subtitulo}>
            <p>
              Bem-vindo(a)! ao nosso catálogo de rações, aqui você que é beneficiário poderá consultar a disponibilidade de ração no estoque e se possui como retirar.
            </p>

            <p className={styles.aviso}>
              <b>Aviso:</b> As doações das rações são separadas pelo peso (kg)
              original do pacote, a quantidade que você pode receber vai depender de
              fatores como: peso do seu animal, quantidade de pets que você possui, etc.
            </p>
          </div>
        </section>

      {/* seleção de categoria e produtos */}
      <section>
        <nav className={styles.linhabolhas}>
          <CategoriaBar
            categoriaAtiva={categoriaAtiva}
            onChange={setCategoriaAtiva}
          />

          {categoriaAtiva === "racao" ? (
            <RacaoCard
              imagem={racaoAzul.src}
              quant="85 kg"
              disponivelRetirada="5 kg"
              agendamentoDisponivel={true}
            />
          ) : (
            <PetiscoCard
              imagem={GatoSafado.src}
              quant="40 kg"
              disponivelRetirada="3 kg"
              agendamentoDisponivel={true}
            />
          )}
        </nav>
      </section>
    </main>
  );
}