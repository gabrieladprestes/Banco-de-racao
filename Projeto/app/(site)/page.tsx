import { CustomTitle } from "@/components/CustomTitle/CustomTitle";
import { CustomPaddingContainer } from "@/components/CustomPaddingContainer/CustomPaddingContainer";
import { IHomeCard } from "@/interfaces/homeCard.interface";
import styles from './Home.module.css';
import { CustomHomeCard } from "@/components/CustomHomeCard/CustomHomeCard";
import { CustomButtonHome } from "@/components/CustomButtonHome/CustomButtonHome";

export default function Home() {
    const Cards: IHomeCard[] = [
        {  
            id: 1,
            image: "https://www.pedigree.com.br/sites/g/files/fnmzdf2401/files/2024-06/desenvolvimento-dos-filhotes-pedigree-04.jpg",
            title: "Cão Filhote",
            link: "../CatalagoRacao",
            alt: "Cachorro Filhote",
        },
        {
            id: 2,
            image: "https://blog-static.petlove.com.br/wp-content/uploads/2022/09/filhote-cachorro-preto-nomes-Petlove.jpg",
            title: "Cão Adulto",
            link: "../CatalagoRacao",
            alt: "Cachorro Adulto",
        },
        {
            id: 3,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAXeGQxxHJnZ08P8rMz83D5i_CiDib-UfWoTcM2G4Zy2wL3q0TZvKC0lXZMhowYqTc1vkFjcgFh7Z-0hqa89d0CZsERcUNNjXLP_QKOTMNJw&s=10",
            title: "Gato Filhote",
            link: "../CatalagoRacao",
            alt: "Gato Filhote",
        },
        {
            id: 4,
            image: "https://panoramapetvet.com.br/wp-content/uploads/2022/10/Os-inconfundiveis-gatos-siameses-691x469.jpg",
            title: "Gato Adulto",
            link: "../CatalagoRacao",
            alt: "Gato Adulto",
        },
    ]

  return (
    <CustomPaddingContainer>
      <CustomTitle title="Banco de Rações" ></CustomTitle>
      <p style={styles} id={styles.subtitle} >Bem-vindo(a) ao banco de ração, este é um projeto sem fins lucrativos, que recebe doações de alimentos para cães e gatos, separa e distribui para pessoas necessitadas que possuem um pet. Acreditamos que nenhum animal deve passar fome, mas sim ser bem alimentado, para que possa ter uma vida longa e saudável, com sua ajuda podemos transformar solidariedade em alimento e esperança.</p>

        <div style={styles} className={styles.cards_container}>
            <div style={styles} className={styles.cards_row}>
                {Cards.map((card) => {
                    return(
                        <div key={card.id} >
                            <CustomHomeCard image={card.image} title={card.title} link={card.link} alt={card.link} />
                        </div>
                    )
                })}
            </div>
        </div>

        <br/>

        <div style={styles} className={styles.button_container}>
            <CustomButtonHome link="../PerfilDonatario" text="Sou Donatário" />
            <CustomButtonHome link="../PerfilDoador" text="Sou Doador" />
        </div>
    </CustomPaddingContainer>
  );
}
