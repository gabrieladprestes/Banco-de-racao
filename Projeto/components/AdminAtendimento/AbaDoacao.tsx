"use client";
import { useEffect, useState } from "react";
import styles from "./AdminAtendimento.module.css";
import { IAdminDoadorCadastro } from "../../interfaces/adminSolicitacao.interface";
import { IAdminDoacaoAgendada } from "../../interfaces/adminDoacaoAgendada.interface";
import { IAdminHistoricoDoacao } from "../../interfaces/adminHistoricoDoacao.interface";
import { buscarDoadores } from "../../services/doadores.service";
import { buscarDoacoesAgendadas, buscarHistoricoDoacoes } from "../../services/doacoes.service";
import { formatarData, getTodayDate } from "../../utils/dateUtils";
import { somenteDigitos } from "../../utils/textoUtils";
import { AdminModalRecebimento } from "../AdminModalRecebimento/AdminModalRecebimento";

// Aba Doação do Atendimento: o doador chega no balcão para entregar uma doação.
//
// Uma busca só (nome, CPF/CNPJ ou código do agendamento) filtra a tabela de doações.
// Se a busca chegar a um doador só, o card dele aparece acima da tabela.

interface IFiltro {
    termo: string;
    data: string;
}

// A doação bate com o termo pelo nome, pelo CPF/CNPJ (só os dígitos) ou pelo código do agendamento
function bateComTermo(d: IAdminDoacaoAgendada, termo: string) {
    const texto = termo.trim().toLowerCase();
    if (!texto) return true;
    const digitos = somenteDigitos(termo);
    return d.nomeDoador.toLowerCase().includes(texto)
        || d.codigoAgendamento.toLowerCase().includes(texto)
        || (digitos.length > 0 && somenteDigitos(d.cpfCnpj).includes(digitos));
}

const mesmoDocumento = (a: string, b: string) => somenteDigitos(a) === somenteDigitos(b);

export function AbaDoacao() {
    const [termo, setTermo] = useState("");
    const [data, setData] = useState("");
    const [filtro, setFiltro] = useState<IFiltro>({ termo: "", data: "" });
    const [doacoes, setDoacoes] = useState<IAdminDoacaoAgendada[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Doadores encontrados pela busca (quando é mais de um, o funcionário escolhe)
    const [encontrados, setEncontrados] = useState<IAdminDoadorCadastro[]>([]);
    const [selecionado, setSelecionado] = useState<IAdminDoadorCadastro | null>(null);
    const [recebidas, setRecebidas] = useState<IAdminHistoricoDoacao[]>([]);

    const [recebimento, setRecebimento] = useState<IAdminDoacaoAgendada | null>(null);
    const [mensagem, setMensagem] = useState("");

    function carregarDoacoes() {
        return buscarDoacoesAgendadas().then(lista => {
            // Do mais antigo para o mais novo: os atrasados ficam em cima
            setDoacoes([...lista].sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada)));
            setCarregando(false);
        });
    }

    useEffect(() => {
        carregarDoacoes();
    }, []);

    // Últimas doações já recebidas do doador
    async function selecionar(doador: IAdminDoadorCadastro) {
        setSelecionado(doador);
        const historico = await buscarHistoricoDoacoes();
        setRecebidas(historico
            .filter(h => mesmoDocumento(h.cpfCnpj, doador.cpfCnpj))
            .sort((a, b) => b.dataRecebimento.localeCompare(a.dataRecebimento))
            .slice(0, 5));
    }

    async function pesquisar() {
        const novo = { termo: termo.trim(), data };
        setFiltro(novo);
        setSelecionado(null);
        setEncontrados([]);
        if (!novo.termo) return;

        // Doadores pelo nome/documento e os donos das doações cujo código bate com a busca
        const porCadastro = await buscarDoadores(novo.termo);
        const docsPorCodigo = doacoes
            .filter(d => d.codigoAgendamento.toLowerCase().includes(novo.termo.toLowerCase()))
            .map(d => d.cpfCnpj);
        const porCodigo = (await Promise.all(docsPorCodigo.map(doc => buscarDoadores(doc)))).flat();
        const unicos = [...porCadastro, ...porCodigo].filter((d, i, lista) => lista.findIndex(x => mesmoDocumento(x.cpfCnpj, d.cpfCnpj)) === i);

        if (unicos.length === 1) await selecionar(unicos[0]);
        else setEncontrados(unicos);
    }

    function limpar() {
        setTermo("");
        setData("");
        setFiltro({ termo: "", data: "" });
        setSelecionado(null);
        setEncontrados([]);
    }

    function recebimentoConcluido(texto: string) {
        setRecebimento(null);
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 6000);
        carregarDoacoes();
        if (selecionado) selecionar(selecionado);
    }

    // Tabela: com um doador escolhido, só as doações dele; senão, o que bate com a busca
    const lista = doacoes.filter(d =>
        (selecionado ? mesmoDocumento(d.cpfCnpj, selecionado.cpfCnpj) : bateComTermo(d, filtro.termo)) &&
        (!filtro.data || d.dataAgendada === filtro.data)
    );
    const temFiltro = filtro.termo !== "" || filtro.data !== "" || termo !== "" || data !== "";
    const hoje = getTodayDate();

    return (
        <>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Doador ou agendamento</label>
                    <input
                        placeholder="Nome, CPF/CNPJ ou código (ex.: AG-2026-016)"
                        value={termo}
                        onChange={e => setTermo(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && pesquisar()}
                    />
                </div>
                <div className={styles.campoData}>
                    <label>Data agendada</label>
                    <input type="date" aria-label="Data agendada" value={data} onChange={e => setData(e.target.value)} />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={pesquisar}>Buscar</button>
                {temFiltro && <button type="button" className={styles.btnLimpar} onClick={limpar}>Limpar</button>}
            </div>

            {encontrados.length > 1 && (
                <div className={styles.escolha}>
                    <p className={styles.escolhaTitulo}>{encontrados.length} doadores encontrados. Escolha um para ver o cadastro:</p>
                    <div className={styles.escolhaLista}>
                        {encontrados.map(d => (
                            <button type="button" key={d.id} className={styles.escolhaItem} onClick={() => { setEncontrados([]); selecionar(d); }}>
                                <strong>{d.nome}</strong> <span>{d.cpfCnpj}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selecionado && (
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>{selecionado.nome}</h2>
                        <span>{selecionado.cpfCnpj} · {selecionado.telefone}</span>
                        <span>{selecionado.endereco}</span>
                    </div>

                    <h3>Últimas doações recebidas</h3>
                    {recebidas.length === 0 ? (
                        <p className={styles.aviso}>Nenhuma doação recebida deste doador.</p>
                    ) : (
                        <table className={styles.tabelaInterna}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Cód. Agendamento</th>
                                    <th>Itens</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recebidas.map(r => (
                                    <tr key={r.id}>
                                        <td>{formatarData(r.dataRecebimento)}</td>
                                        <td>{r.codigoAgendamento}</td>
                                        <td>{r.itens.map(i => `${i.nome} (${i.quantidade})`).join(", ")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            <h3 className={styles.tituloSecao}>
                {selecionado ? `Doações de ${selecionado.nome} para receber` : "Doações para receber"}
                {!carregando && <span className={styles.contador}>{lista.length}</span>}
            </h3>
            <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Cód. Agendamento</th>
                            <th>Doador</th>
                            <th>Item</th>
                            <th>Quantidade</th>
                            <th>Data agendada</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map(d => (
                            <tr key={d.id} className={d.dataAgendada < hoje ? styles.linhaAtrasada : undefined}>
                                <td>{d.codigoAgendamento}</td>
                                <td>{d.nomeDoador}</td>
                                <td>{d.item}</td>
                                <td>{d.quantidade}</td>
                                <td className={styles.colData}>
                                    {formatarData(d.dataAgendada)}
                                    {d.dataAgendada < hoje && <span className={styles.tagAtrasada}>Atrasada</span>}
                                    {d.dataAgendada === hoje && <span className={styles.tagHoje}>Hoje</span>}
                                </td>
                                <td className={styles.colAcao}>
                                    <button type="button" className={styles.btnAcao} onClick={() => setRecebimento(d)}>Receber</button>
                                </td>
                            </tr>
                        ))}
                        {lista.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.semResultados}>
                                    {carregando ? "Carregando…"
                                        : selecionado ? "Nenhuma doação agendada para este doador."
                                        : temFiltro ? "Nenhuma doação encontrada com essa busca."
                                        : "Nenhuma doação aguardando recebimento."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {recebimento && (
                <AdminModalRecebimento
                    key={recebimento.id}
                    doacao={recebimento}
                    onFechar={() => setRecebimento(null)}
                    onConcluido={recebimentoConcluido}
                />
            )}
        </>
    );
}
