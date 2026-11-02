import styles from "./Recibo.module.css";

type ReciboProps = {
    tipodoacao: string;
  numero: string;
  nome: string;
  documento: string;
  orgao: string;
  rua: string;
  cidade: string;
  numeroEndereco: string;
  cnpj: string;

  codigoItem: string;
  quantidade: string;
  descricao: string;
  lote: string;
  data: string;
  hora: string;
};

export default function Recibo({
    tipodoacao,
  numero,
  nome,
  documento,
  orgao,
  rua,
  cidade,
  numeroEndereco,
  cnpj,
  codigoItem,
  quantidade,
  descricao,
  lote,
  data,
  hora,
}: ReciboProps) {
  return (
    <main className={styles.content}>
      <div className={styles.bloco_recibo}>
        <div className={styles.cabecalho_rec}>
          <h1>Recibo de {tipodoacao}</h1>
          <h6>Nº {numero}</h6>
        </div>

        <div className={styles.recibo_meio}>
          <table className={styles.recibo_tbl}>
            <thead>
              <tr>
                <th colSpan={3}>Nome: {nome}</th>
                <th colSpan={3}>CPF/CNPJ: {documento}</th>
              </tr>
              <tr>
                <th>Orgão emissor: {orgao}</th>
                <th colSpan={2}>Rua: {rua}</th>
                <th>Cidade: {cidade}</th>
                <th>Nº: {numeroEndereco}</th>
                <th>CNPJ: {cnpj}</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th>Código item:</th>
                <th>Quantidade:</th>
                <th>Descrição:</th>
                <th>Lote:</th>
                <th>Data:</th>
                <th>Hora:</th>
              </tr>

              <tr>
                <td>{codigoItem}</td>
                <td>{quantidade}</td>
                <td>{descricao}</td>
                <td>{lote}</td>
                <td>{data}</td>
                <td>{hora}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.linha_botaorec}>
            <button className={styles.button_recibo}>
              Imprimir
            </button>

            <button className={styles.button_recibo}>
              Exportar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}