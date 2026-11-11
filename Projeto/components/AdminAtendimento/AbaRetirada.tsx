"use client";
import { useEffect, useState } from "react";
import styles from "./AdminAtendimento.module.css";
import { IAdminDonatario } from "../../interfaces/adminDonatario.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminCotaProduto } from "../../interfaces/adminAtendimento.interface";
import { IAdminSaidaDoacao } from "../../interfaces/adminSaidaDoacao.interface";
import { IAdminSolicitacaoItem } from "../../interfaces/adminSolicitacao.interface";
import { COTA_MENSAL_KG, calcularCotas } from "../../services/atendimento.service";
import { buscarDonatarios } from "../../services/donatarios.service";
import { buscarEstoque } from "../../services/estoque.service";
import { buscarAprovadosDoMes, buscarRetiradasDoMes, buscarSaidasPendentes } from "../../services/retiradas.service";
import { formatarData, getTodayDate } from "../../utils/dateUtils";
import { somenteDigitos } from "../../utils/textoUtils";
import { AdminModalEntrega } from "../AdminModalEntrega/AdminModalEntrega";

// Aba Retirada do Atendimento: o donatário chega no balcão para retirar o que foi agendado.
// Retirada só acontece com agendamento aprovado (controle de cota e de estoque).
//
// Uma busca só (nome, CPF ou código do agendamento) filtra a tabela de retiradas.
// Se a busca chegar a um donatário só, o card dele aparece acima da tabela.

const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

function statusCota(cota: IAdminCotaProduto) {
    if (cota.liberado > 0) return { texto: `Liberado ${cota.liberado} kg`, classe: styles.badgeBom };
    if (cota.saldoCota === 0) return { texto: "Cota esgotada", classe: styles.badgeVencido };
    return { texto: "Sem estoque", classe: styles.badgeVencendo };
}

interface IFiltro {
    termo: string;
    data: string;
}

// A retirada bate com o termo pelo nome, pelo CPF (só os dígitos) ou pelo código do agendamento
function bateComTermo(s: IAdminSaidaDoacao, termo: string) {
    const texto = termo.trim().toLowerCase();
    if (!texto) return true;
    const digitos = somenteDigitos(termo);
    return s.nomeDonatario.toLowerCase().includes(texto)
        || s.codigoAgendamento.toLowerCase().includes(texto)
        || (digitos.length > 0 && somenteDigitos(s.cpf).includes(digitos));
}

const mesmoCpf = (a: string, b: string) => somenteDigitos(a) === somenteDigitos(b);

export function AbaRetirada() {
    const [termo, setTermo] = useState("");
    const [data, setData] = useState("");
    const [filtro, setFiltro] = useState<IFiltro>({ termo: "", data: "" });
    const [saidas, setSaidas] = useState<IAdminSaidaDoacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);

    // Donatários encontrados pela busca (quando é mais de um, o funcionário escolhe)
    const [encontrados, setEncontrados] = useState<IAdminDonatario[]>([]);
    const [selecionado, setSelecionado] = useState<IAdminDonatario | null>(null);
    const [retiradasMes, setRetiradasMes] = useState<IAdminHistoricoRetirada[]>([]);
    const [aprovadosMes, setAprovadosMes] = useState<IAdminSolicitacaoItem[]>([]);

    const [entrega, setEntrega] = useState<IAdminSaidaDoacao | null>(null);
    const [mensagem, setMensagem] = useState("");

    function carregarSaidas() {
        return buscarSaidasPendentes().then(lista => {
            // Do mais antigo para o mais novo: os atrasados ficam em cima
            setSaidas([...lista].sort((a, b) => a.dataAgendada.localeCompare(b.dataAgendada)));
            setCarregando(false);
        });
    }

    useEffect(() => {
        carregarSaidas();
        buscarEstoque().then(setEstoque);
    }, []);

    async function selecionar(donatario: IAdminDonatario) {
        setSelecionado(donatario);
        const [retiradas, aprovados] = await Promise.all([
            buscarRetiradasDoMes(donatario.cpf),
            buscarAprovadosDoMes(donatario.cpf),
        ]);
        setRetiradasMes(retiradas);
        setAprovadosMes(aprovados);
    }

    async function pesquisar() {
        const novo = { termo: termo.trim(), data };
        setFiltro(novo);
        setSelecionado(null);
        setEncontrados([]);
        if (!novo.termo) return;

        // Donatários pelo nome/CPF e os donos das retiradas cujo código bate com a busca
        const porCadastro = await buscarDonatarios(novo.termo);
        const cpfsPorCodigo = saidas
            .filter(s => s.codigoAgendamento.toLowerCase().includes(novo.termo.toLowerCase()))
            .map(s => s.cpf);
        const porCodigo = (await Promise.all(cpfsPorCodigo.map(cpf => buscarDonatarios(cpf)))).flat();
        const unicos = [...porCadastro, ...porCodigo].filter((d, i, lista) => lista.findIndex(x => mesmoCpf(x.cpf, d.cpf)) === i);

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

    function entregaConcluida(texto: string) {
        setEntrega(null);
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 6000);
        carregarSaidas();
        buscarEstoque().then(setEstoque);
        if (selecionado) selecionar(selecionado);
    }

    // Tabela: com um donatário escolhido, só as retiradas dele; senão, o que bate com a busca
    const lista = saidas.filter(s =>
        (selecionado ? mesmoCpf(s.cpf, selecionado.cpf) : bateComTermo(s, filtro.termo)) &&
        (!filtro.data || s.dataAgendada === filtro.data)
    );
    const temFiltro = filtro.termo !== "" || filtro.data !== "" || termo !== "" || data !== "";
    const cotas = selecionado ? calcularCotas(selecionado.pets, retiradasMes, aprovadosMes, estoque) : [];
    const totalRetirado = retiradasMes.flatMap(r => r.itens).reduce((acc, i) => acc + i.quantidade, 0);
    const hoje = getTodayDate();

    return (
        <>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Donatário ou agendamento</label>
                    <input
                        placeholder="Nome, CPF ou código (ex.: RET-2026-020)"
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
                    <p className={styles.escolhaTitulo}>{encontrados.length} donatários encontrados. Escolha um para ver o cadastro:</p>
                    <div className={styles.escolhaLista}>
                        {encontrados.map(d => (
                            <button type="button" key={d.id} className={styles.escolhaItem} onClick={() => { setEncontrados([]); selecionar(d); }}>
                                <strong>{d.nome}</strong> <span>{d.cpf}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selecionado && (
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2>{selecionado.nome}</h2>
                        <span>{selecionado.cpf} · {selecionado.telefone}</span>
                        <span>{selecionado.endereco}</span>
                    </div>

                    <div className={styles.colunas}>
                        <div>
                            <h3>Pets cadastrados</h3>
                            {selecionado.pets.length === 0 ? (
                                <p className={styles.aviso}>Nenhum pet cadastrado. Não há cota para liberar.</p>
                            ) : (
                                <table className={styles.tabelaInterna}>
                                    <thead>
                                        <tr>
                                            <th>Pet</th>
                                            <th>Espécie</th>
                                            <th>Porte</th>
                                            <th>Cota/mês</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selecionado.pets.map(pet => (
                                            <tr key={pet.id}>
                                                <td>{pet.nome}</td>
                                                <td>{pet.especie}</td>
                                                <td>{pet.porte}</td>
                                                <td>{COTA_MENSAL_KG[pet.especie][pet.porte]} kg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div>
                            <h3>Retiradas em {mesAtual}</h3>
                            {retiradasMes.length === 0 ? (
                                <p className={styles.aviso}>Nenhuma retirada neste mês.</p>
                            ) : (
                                <table className={styles.tabelaInterna}>
                                    <thead>
                                        <tr>
                                            <th>Data</th>
                                            <th>Item</th>
                                            <th>Qtd.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {retiradasMes.flatMap(r => r.itens.map((item, i) => (
                                            <tr key={`${r.id}-${i}`}>
                                                <td>{formatarData(r.dataRetirada)}</td>
                                                <td>{item.nome}</td>
                                                <td>{item.quantidade} kg</td>
                                            </tr>
                                        )))}
                                    </tbody>
                                </table>
                            )}
                            <p className={styles.total}>Total retirado no mês: <strong>{totalRetirado} kg</strong></p>
                        </div>
                    </div>

                    {cotas.length > 0 && (
                        <>
                            <h3>Cota do mês</h3>
                            <table className={styles.tabelaInterna}>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Cota do mês</th>
                                        <th>Retirado</th>
                                        <th>Aprovado a retirar</th>
                                        <th>Saldo da cota</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cotas.map(cota => {
                                        const status = statusCota(cota);
                                        return (
                                            <tr key={cota.codigo}>
                                                <td>{cota.nome}</td>
                                                <td>{cota.cotaMensal} kg</td>
                                                <td>{cota.retiradoMes} kg</td>
                                                <td>{cota.aprovadoMes} kg</td>
                                                <td>{cota.saldoCota} kg</td>
                                                <td><span className={`${styles.badge} ${status.classe}`}>{status.texto}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}
                </section>
            )}

            <h3 className={styles.tituloSecao}>
                {selecionado ? `Retiradas de ${selecionado.nome} para entregar` : "Retiradas para entregar"}
                {!carregando && <span className={styles.contador}>{lista.length}</span>}
            </h3>
            <div className={styles.tabelaWrapper}>
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            <th>Cód. Agendamento</th>
                            <th>Donatário</th>
                            <th>Itens</th>
                            <th>Data agendada</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lista.map(s => (
                            <tr key={s.id} className={s.dataAgendada < hoje ? styles.linhaAtrasada : undefined}>
                                <td>{s.codigoAgendamento}</td>
                                <td>{s.nomeDonatario}</td>
                                <td>{s.itens.map(i => `${i.item} (${i.quantidadeSolicitada} kg)`).join(", ")}</td>
                                <td className={styles.colData}>
                                    {formatarData(s.dataAgendada)}
                                    {s.dataAgendada < hoje && <span className={styles.tagAtrasada}>Atrasada</span>}
                                    {s.dataAgendada === hoje && <span className={styles.tagHoje}>Hoje</span>}
                                </td>
                                <td className={styles.colAcao}>
                                    <button type="button" className={styles.btnAcao} onClick={() => setEntrega(s)}>Entregar</button>
                                </td>
                            </tr>
                        ))}
                        {lista.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.semResultados}>
                                    {carregando ? "Carregando…"
                                        : selecionado ? "Nenhuma retirada aprovada para este donatário. A retirada precisa ser agendada e aprovada antes."
                                        : temFiltro ? "Nenhuma retirada encontrada com essa busca."
                                        : "Nenhuma retirada aguardando entrega."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {entrega && (
                <AdminModalEntrega
                    key={entrega.id}
                    saida={entrega}
                    onFechar={() => setEntrega(null)}
                    onConcluido={entregaConcluida}
                />
            )}
        </>
    );
}
