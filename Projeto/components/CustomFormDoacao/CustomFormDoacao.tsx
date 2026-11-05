
import styles from "./CustomFormDoacao.module.css"

// Props do componente: recebe a função de submit vinda do componente pai
interface CustomFormDoacaoProps {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// Formulário para registrar uma nova doação
export const CustomFormDoacao = (props: CustomFormDoacaoProps) => {
    return (
        <>
            <div>
                <form onSubmit={props.onSubmit} className={styles.simpleForm}>

                    <h2>Resgistrar Doação</h2>

                    <input name="nome" placeholder="Nome do Doador" />

                    <input name="cpfCnpj" placeholder="CPF/CNPJ" />

                    <select name="tipo" title="Tipo de doação">
                        <option value="">Selecione</option>
                        <option value="racao">Ração</option>
                        <option value="petisco">Pestisco</option>
                        <option value="medicamento">Medicamento</option>
                        <option value="outros">Outros</option>
                    </select>

                    <input type="number" name="quantidade" placeholder="Quantidade" />

                    <div>
                        <label className={styles.label}>Validade</label>
                        <input type="date" name="data_validade" placeholder="Validade" />
                    </div>
                    <input name="descricao" placeholder="Descrição" />

                    <textarea name="obs" placeholder="Observações"></textarea>

                    <button type="submit" className="btn btn-success">Salvar</button>

                </form>
            </div>
        </>
    )
}
