import RacaoCard from "@/components/CustomRacaoCard/Racaocard";
import styles from "./CatalagoRacao.module.css";
import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";

export default function CatalogoRacao() {
  return (
    <main>
      {/* informações de cima */}
      <CustomPaddingContainer>
        <section>
          <h1 className={styles.titulo}>Catálogo de produtos</h1>

          <p>
            Bem-vindo(a)! ao nosso catálogo de rações, aqui você vai encontrar
            rações para cada tipo específico de pet, todas já são separadas por
            categoria de ração, suplementos, petisco, ração úmida etc.
          </p>

          <p className={styles.aviso}>
            <b>Aviso:</b> As doações das rações são separadas pelo peso (kg)
            original do pacote, a quantidade que você pode receber vai depender de
            fatores como: peso do seu animal, quantidade de pets que você possui, etc.
          </p>
        </section>
        <></>
      </CustomPaddingContainer>

      {/* seleção */}
      <section>
        <nav>
          <ul className={styles.selerac}>
            <li>Ração Seca</li>
            <li>Ração Úmida</li>
            <li>Leite Substitutivo</li>
            <li>Petiscos</li>
            <li>Suplementos</li>
            <li>Dietas Terapêuticas</li>
            <li>Outros</li>
          </ul>

          <br />
        </nav>

        {/* produtos */}
        <nav className={styles.linhabolhas}>
          <RacaoCard
          imagem="https://png.pngtree.com/png-clipart/20210801/original/pngtree-dog-food-and-food-healthy-breeding-png-image_6577106.jpg"
          peso="Ração 1,5Kg"
          />
          <RacaoCard
          imagem="https://png.pngtree.com/png-clipart/20210801/original/pngtree-dog-food-and-food-healthy-breeding-png-image_6577106.jpg"
          peso="Ração 2,5Kg"
          />
          <RacaoCard
          imagem="https://png.pngtree.com/png-clipart/20210801/original/pngtree-dog-food-and-food-healthy-breeding-png-image_6577106.jpg"
          peso="Ração 3Kg"
          />
        </nav>
      </section>
    </main>
  );
}