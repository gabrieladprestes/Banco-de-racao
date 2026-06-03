"use client";
import { useState } from "react";
import styles from "./AdminCadastroProduto.module.css";

interface IProduto {
    id: number;
    codigo: string;
    nome: string;
    tipo: string;
    unidade: string;
    descricao: string;
    estoqueMinimo: number;
}

const produtosIniciais: IProduto[] = [
    { id: 1, codigo: "RC001", nome: "Ração de Cachorro", tipo: "Ração",       unidade: "kg", descricao: "Ração seca para cães adultos",    estoqueMinimo: 20 },
    { id: 2, codigo: "RG001", nome: "Ração de Gato",     tipo: "Ração",       unidade: "kg", descricao: "Ração seca para gatos adultos",   estoqueMinimo: 15 },
    { id: 3, codigo: "VC001", nome: "Vermífugo Cães",    tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para cães",         estoqueMinimo: 10 },
    { id: 4, codigo: "VG001", nome: "Vermífugo Gatos",   tipo: "Medicamento", unidade: "un", descricao: "Vermífugo oral para gatos",        estoqueMinimo: 10 },
    { id: 5, codigo: "AP001", nome: "Antipulgas",        tipo: "Medicamento", unidade: "un", descricao: "Antipulgas e carrapatos",          estoqueMinimo: 8  },
    { id: 6, codigo: "PC001", nome: "Petisco Cachorro",  tipo: "Petisco",     unidade: "kg", descricao: "Petisco salgado para cães",        estoqueMinimo: 5  },
    { id: 7, codigo: "PG001", nome: "Petisco Gato",      tipo: "Petisco",     unidade: "kg", descricao: "Petisco para gatos",               estoqueMinimo: 5  },
];

export const AdminCadastroProduto = () => {
    const [produtos, setProdutos] = useState<IProduto[]>(produtosIniciais);
    const [codigo, setCodigo] = useState("");
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
    const [unidade, setUnidade] = useState("kg");
    const [descricao, setDescricao] = useState("");
    const [estoqueMinimo, setEstoqueMinimo] = useState(0);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!codigo || !nome || !tipo) {
            setErro("Preencha código, nome e tipo.");
            return;
        }
        if (produtos.some(p => p.codigo === codigo)) {
            setErro("Já existe um produto com este código.");
            return;
        }
        setProdutos([...produtos, { id: produtos.length + 1, codigo, nome, tipo, unidade, descricao, estoqueMinimo }]);
        setCodigo("");
        setNome("");
        setTipo("");
        setUnidade("kg");
        setDescricao("");
        setEstoqueMinimo(0);
        setErro("");
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
    }

    return (
        <div className={styles.layout}>

            {/* Formulário */}
            <div className={styles.card}>
                <h3 className={styles.cardTitulo}>Novo Produto</h3>
                <form onSubmit={salvar} className={styles.form}>

                    <div className={styles.row2}>
                        <div className={styles.campo}>
                            <label>Código *</label>
                            <input
                                placeholder="ex: RC001"
                                value={codigo}
                                onChange={e => setCodigo(e.target.value.toUpperCase())}
                            />
                        </div>
                        <div className={styles.campo}>
                            <label>Tipo *</label>
                            <select aria-label="Tipo" value={tipo} onChange={e => setTipo(e.target.value)}>
                                <option value="">Selecione</option>
                                <option value="Ração">Ração</option>
                                <option value="Petisco">Petisco</option>
                                <option value="Medicamento">Medicamento</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.campo}>
                        <label>Nome do produto *</label>
                        <input
                            placeholder="ex: Ração de Cachorro"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                        />
                    </div>

                    <div className={styles.row2}>
                        <div className={styles.campo}>
                            <label>Unidade de medida</label>
                            <select aria-label="Unidade de medida" value={unidade} onChange={e => setUnidade(e.target.value)}>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="un">un</option>
                                <option value="ml">ml</option>
                                <option value="L">L</option>
                                <option value="caixa">caixa</option>
                            </select>
                        </div>
                        <div className={styles.campo}>
                            <label>Estoque mínimo de alerta</label>
                            <input
                                type="number"
                                aria-label="Estoque mínimo"
                                min={0}
                                value={estoqueMinimo}
                                onChange={e => setEstoqueMinimo(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={styles.campo}>
                        <label>Descrição</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Descrição opcional do produto..."
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                        />
                    </div>

                    {erro && <p className={styles.msgErro}>{erro}</p>}
                    {sucesso && <p className={styles.msgSucesso}>Produto cadastrado com sucesso!</p>}

                    <button type="submit" className={styles.btnSalvar}>Cadastrar Produto</button>
                </form>
            </div>

            {/* Lista */}
            <div className={styles.card}>
                <h3 className={styles.cardTitulo}>Produtos Cadastrados ({produtos.length})</h3>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Unidade</th>
                            <th>Est. mínimo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map(p => (
                            <tr key={p.id} title={p.descricao}>
                                <td><span className={styles.codPill}>{p.codigo}</span></td>
                                <td>{p.nome}</td>
                                <td>{p.tipo}</td>
                                <td>{p.unidade}</td>
                                <td>{p.estoqueMinimo} {p.unidade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};
