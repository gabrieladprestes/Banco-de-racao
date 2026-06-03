
export default function Sobre() {
  return (
    <main>
      <section>
        <h1 className="titulo">Sobre Nós</h1>

        <div className="caixa-sobre">
          <div className="sobre-o">
            <div>
              <h2>Nosso Objetivo</h2>
              <br />
              <p>
                Temos como objetivo central combater a fome e a má nutrição de
                cães e gatos em situação de vulnerabilidade em nosso município.
                Através da arrecadação e gestão de doações de alimentos,
                criamos uma ponte sólida entre a generosidade da população e os
                animais que mais precisam.
              </p>
            </div>

            <img
              src="/img/cachorroscorrendo.jpg"
              className="sobre-img"
              alt="cachorros correndo"
            />
          </div>

          <hr className="divisao-sobre" />

          <div className="sobre-e">
            <img
              src="/img/discussaoamigavel.jpg"
              className="sobre-img"
              alt="equipe conversando"
            />

            <div>
              <h2>Nossa Equipe</h2>
              <br />
              <p>
                Somos uma equipe dedicada de servidores públicos e voluntários
                unidos por um propósito comum: fazer a diferença na vida dos
                animais da nossa cidade. Nosso time combina experiência em
                logística, gestão de doações, e bem-estar animal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}