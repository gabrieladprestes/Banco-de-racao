"use client";
import { useEffect, useState } from "react";
import styles from "./AdminGerenciarAgendas.module.css";
import { IAdminAgenda, IAdminAgendaItem } from "../../interfaces/adminAgenda.interface";
import { IAdminAgendaDoacao } from "../../interfaces/adminAgendaDoacao.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { aprovarRetirada, buscarSolicitacoesRetirada, reabrirRetirada, recusarRetirada } from "../../services/retiradas.service";
import { aprovarDoacao, buscarSolicitacoesDoacao, reabrirDoacao, recusarDoacao } from "../../services/doacoes.service";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import { somenteDigitos } from "../../utils/textoUtils";
import { PackageMinus, PackagePlus, X } from "lucide-react";
import { disponivelParaLiberar } from "../../utils/estoqueUtils";

function badgeClass(status: string, s: Record<string, string>) {
    if (status === "aprovado") return s.badgeAprovado;
    if (status === "recusado") return s.badgeRecusado;
    return s.badgePendente;
}

function labelStatus(status: string) {
    if (status === "aprovado") return "Aprovado";
    if (status === "recusado") return "Recusado";
    return "Pendente";
}

interface IFiltro {
    busca: string;
    status: string;
    data: string;
}
const FILTRO_VAZIO: IFiltro = { busca: "", status: "", data: "" };
const igual = (a: IFiltro, b: IFiltro) => JSON.stringify(a) === JSON.stringify(b);

// A busca aceita nome, CPF/CNPJ (com ou sem pontuação) e código do agendamento
function bateBusca(termo: string, nome: string, documento: string, codigo?: string) {
    const t = termo.trim().toLowerCase();
    if (!t) return true;
    const digitos = somenteDigitos(termo);
    return nome.toLowerCase().includes(t)
        || (codigo ?? "").toLowerCase().includes(t)
        || (digitos.length >= 3 && somenteDigitos(documento).includes(digitos));
}

// Pendentes primeiro (é o que precisa de ação); dentro de cada status, pela data
const ORDEM_STATUS: Record<string, number> = { pendente: 0, aprovado: 1, recusado: 2 };
function ordenar<T extends { status: string }>(lista: T[], data: (x: T) => string) {
    return [...lista].sort((a, b) => (ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status]) || data(a).localeCompare(data(b)));
}

export const AdminGerenciarAgendas = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");
    // Agendamento aberto no modal: "r-15" (retirada) ou "d-12" (doação)
    const [aberto, setAberto] = useState<string | null>(null);
    const [mensagem, setMensagem] = useState("");
    const [carregando, setCarregando] = useState(true);

    const [retiradas, setRetiradas] = useState<IAdminAgenda[]>([]);
    const [doacoes, setDoacoes] = useState<IAdminAgendaDoacao[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);

    // Filtros de cada aba: o que está nos campos e o que foi aplicado no Buscar
    const [camposR, setCamposR] = useState<IFiltro>(FILTRO_VAZIO);
    const [filtroR, setFiltroR] = useState<IFiltro>(FILTRO_VAZIO);
    const [camposD, setCamposD] = useState<IFiltro>(FILTRO_VAZIO);
    const [filtroD, setFiltroD] = useState<IFiltro>(FILTRO_VAZIO);

    // Edições ainda não gravadas, por card ("r-15", "d-12")
    const [datas, setDatas] = useState<Record<string, string>>({});
    const [quantidades, setQuantidades] = useState<Record<string, number>>({}); // chave: "15-RC001"
    const [observacoes, setObservacoes] = useState<Record<string, string>>({});
    const [erros, setErros] = useState<Record<string, string>>({});

    // Busca tudo nos services (depois de cada decisão, cotas e estoque mudam)
    const buscarTudo = () => Promise.all([buscarSolicitacoesRetirada(), buscarSolicitacoesDoacao(), buscarEstoque()]);

    function aplicar([r, d, e]: Awaited<ReturnType<typeof buscarTudo>>) {
        setRetiradas(ordenar(r, x => x.dataAgendada));
        setDoacoes(ordenar(d, x => x.dataProposta));
        setEstoque(e);
        setCarregando(false);
    }

    async function recarregar() {
        aplicar(await buscarTudo());
    }

    // Carrega uma vez ao abrir a tela; depois, recarregar() é chamado a cada decisão
    useEffect(() => {
        buscarTudo().then(aplicar);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function trocarAba(nova: "retiradas" | "doacoes") {
        setAba(nova);
        setAberto(null);
    }

    function disponivel(codigo: string) {
        const item = estoque.find(e => e.codigo === codigo);
        return item ? disponivelParaLiberar(item.lotes) : 0;
    }

    function qtd(agenda: IAdminAgenda, item: IAdminAgendaItem) {
        return quantidades[`${agenda.id}-${item.codigoProduto}`] ?? item.quantidade;
    }

    // Situação de um item pendente: sem estoque bloqueia; acima da cota só avisa
    function situacao(agenda: IAdminAgenda, item: IAdminAgendaItem) {
        const q = qtd(agenda, item);
        const cota = agenda.cotas.find(c => c.codigo === item.codigoProduto);
        if (q > disponivel(item.codigoProduto)) return { texto: "Sem estoque", classe: styles.badgeRecusado, bloqueia: true };
        if (!cota) return { texto: "Sem cota definida", classe: styles.badgePendente, bloqueia: false };
        if (q > cota.saldoCota) return { texto: "Acima da cota", classe: styles.badgePendente, bloqueia: false };
        return { texto: "OK", classe: styles.badgeAprovado, bloqueia: false };
    }

    function textoCota(agenda: IAdminAgenda, codigo: string) {
        const cota = agenda.cotas.find(c => c.codigo === codigo);
        if (!cota) return "—";
        return `${cota.saldoCota} de ${cota.cotaMensal} kg`;
    }

    // Executa uma decisão: mostra erro no card ou recarrega e avisa
    async function executar(chave: string, acao: () => Promise<void>, texto: string) {
        try {
            await acao();
            setErros({ ...erros, [chave]: "" });
            setObservacoes({ ...observacoes, [chave]: "" });
            await recarregar();
            setAberto(null);
            setMensagem(texto);
            setTimeout(() => setMensagem(""), 5000);
        } catch (e) {
            setErros({ ...erros, [chave]: (e as Error).message });
        }
    }

    function aprovarR(agenda: IAdminAgenda) {
        const chave = `r-${agenda.id}`;
        const itens = agenda.itensSolicitados.map(i => ({ codigoProduto: i.codigoProduto, quantidade: qtd(agenda, i) }));
        executar(chave, () => aprovarRetirada(agenda.id, itens, datas[chave] ?? agenda.dataAgendada, observacoes[chave] ?? ""),
            `Retirada ${agenda.codigoAgendamento} aprovada. A quantidade foi reservada no estoque.`);
    }

    function campoObservacao(chave: string, obrigatorio: string) {
        return (
            <div className={styles.observacao}>
                <label>Observação / motivo</label>
                <textarea
                    placeholder={`Obrigatório para ${obrigatorio}...`}
                    value={observacoes[chave] ?? ""}
                    onChange={e => { setObservacoes({ ...observacoes, [chave]: e.target.value }); setErros({ ...erros, [chave]: "" }); }}
                />
            </div>
        );
    }

    const listaR = retiradas.filter(r =>
        (!filtroR.status || r.status === filtroR.status) &&
        (!filtroR.data || r.dataAgendada === filtroR.data) &&
        bateBusca(filtroR.busca, r.donatario, r.cpf, r.codigoAgendamento)
    );
    const listaD = doacoes.filter(d =>
        (!filtroD.status || d.status === filtroD.status) &&
        (!filtroD.data || d.dataProposta === filtroD.data) &&
        bateBusca(filtroD.busca, d.doador, d.cpfCnpj, d.codigoAgendamento)
    );

    const ehRetiradas = aba === "retiradas";
    const campos = ehRetiradas ? camposR : camposD;
    const setCampos = ehRetiradas ? setCamposR : setCamposD;
    const filtroAtual = ehRetiradas ? filtroR : filtroD;
    const temFiltro = !igual(campos, FILTRO_VAZIO) || !igual(filtroAtual, FILTRO_VAZIO);
    const total = ehRetiradas ? retiradas.length : doacoes.length;
    const mostrando = ehRetiradas ? listaR.length : listaD.length;
    const pendentesR = retiradas.filter(r => r.status === "pendente").length;
    const pendentesD = doacoes.filter(d => d.status === "pendente").length;

    function buscar() {
        if (ehRetiradas) setFiltroR(camposR);
        else setFiltroD(camposD);
    }

    function limpar() {
        setCampos(FILTRO_VAZIO);
        if (ehRetiradas) setFiltroR(FILTRO_VAZIO);
        else setFiltroD(FILTRO_VAZIO);
    }

    // Itens com a unidade de cada produto, para a tabela
    const resumoItens = (agenda: IAdminAgenda) =>
        agenda.itensSolicitados.map(i => `${i.item} (${i.quantidade} ${i.unidade})`).join(", ");

    const linhaVazia = (colunas: number) => (
        <tr>
            <td colSpan={colunas} className={styles.semResultados}>
                {carregando ? "Carregando…" : temFiltro ? "Nenhum agendamento encontrado com esses filtros." : "Nenhum agendamento."}
            </td>
        </tr>
    );

    // Agendamento aberto no modal
    const agenda = aberto?.startsWith("r-") ? retiradas.find(r => `r-${r.id}` === aberto) : undefined;
    const doacao = aberto?.startsWith("d-") ? doacoes.find(d => `d-${d.id}` === aberto) : undefined;

    return (
        <>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.abas} role="tablist">
                <button type="button" role="tab" aria-selected={ehRetiradas} className={`${styles.aba} ${ehRetiradas ? styles.abaAtiva : ""}`} onClick={() => trocarAba("retiradas")}>
                    <PackageMinus size={18} aria-hidden /> Retiradas <span className={styles.abaSub}>donatário</span>
                    {pendentesR > 0 && <span className={styles.contadorAba} title="Pendentes">{pendentesR}</span>}
                </button>
                <button type="button" role="tab" aria-selected={!ehRetiradas} className={`${styles.aba} ${!ehRetiradas ? styles.abaAtiva : ""}`} onClick={() => trocarAba("doacoes")}>
                    <PackagePlus size={18} aria-hidden /> Doações <span className={styles.abaSub}>doador</span>
                    {pendentesD > 0 && <span className={styles.contadorAba} title="Pendentes">{pendentesD}</span>}
                </button>
            </div>

            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Busca</label>
                    <input
                        placeholder={ehRetiradas ? "Donatário, CPF ou código (ex.: RET-2026-018)" : "Doador, CPF/CNPJ ou código (ex.: AG-2026-012)"}
                        value={campos.busca}
                        onChange={e => setCampos({ ...campos, busca: e.target.value })}
                        onKeyDown={e => e.key === "Enter" && buscar()}
                    />
                </div>
                <div>
                    <label>Status</label>
                    <select aria-label="Filtrar por status" value={campos.status} onChange={e => setCampos({ ...campos, status: e.target.value })}>
                        <option value="">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="recusado">Recusado</option>
                    </select>
                </div>
                <div>
                    <label>{ehRetiradas ? "Data agendada" : "Data prevista"}</label>
                    <input type="date" aria-label="Filtrar por data" value={campos.data} onChange={e => setCampos({ ...campos, data: e.target.value })} />
                </div>
                <button type="button" className={styles.btnFiltrar} onClick={buscar}>Buscar</button>
                {temFiltro && <button type="button" className={styles.btnLimpar} onClick={limpar}>Limpar</button>}
            </div>

            {!carregando && (
                <p className={styles.contador}>
                    {mostrando === total ? `${total} agendamentos · pendentes primeiro` : `Mostrando ${mostrando} de ${total}`}
                </p>
            )}

            {ehRetiradas ? (
                <div className={styles.tabelaWrapper}>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Cód. Agendamento</th>
                                <th>Donatário</th>
                                <th>CPF</th>
                                <th>Itens</th>
                                <th>Solicitado em</th>
                                <th>Agendado para</th>
                                <th>Status</th>
                                <th><span className={styles.somenteLeitor}>Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaR.map(r => (
                                <tr key={r.id}>
                                    <td className={styles.nowrap}>{r.codigoAgendamento}</td>
                                    <td>{r.donatario}</td>
                                    <td className={styles.nowrap}>{r.cpf}</td>
                                    <td className={styles.tdItens}>{resumoItens(r)}</td>
                                    <td className={styles.nowrap}>{formatarData(r.dataSolicitacao)}</td>
                                    <td className={styles.nowrap}>{formatarData(r.dataAgendada)}</td>
                                    <td><span className={`${styles.badge} ${badgeClass(r.status, styles)}`}>{labelStatus(r.status)}</span></td>
                                    <td className={styles.colAcao}>
                                        <button type="button" className={r.status === "pendente" ? styles.btnAnalisar : styles.btnVer} onClick={() => setAberto(`r-${r.id}`)}>
                                            {r.status === "pendente" ? "Analisar" : "Ver"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {listaR.length === 0 && linhaVazia(8)}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.tabelaWrapper}>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th>Cód. Agendamento</th>
                                <th>Doador</th>
                                <th>CPF / CNPJ</th>
                                <th>Item</th>
                                <th>Quantidade</th>
                                <th>Data prevista</th>
                                <th>Status</th>
                                <th><span className={styles.somenteLeitor}>Ações</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaD.map(d => (
                                <tr key={d.id}>
                                    <td className={styles.nowrap}>{d.codigoAgendamento}</td>
                                    <td>{d.doador}</td>
                                    <td className={styles.nowrap}>{d.cpfCnpj}</td>
                                    <td>{d.item}</td>
                                    <td className={styles.nowrap}>{d.quantidade} {d.unidade}</td>
                                    <td className={styles.nowrap}>{formatarData(d.dataProposta)}</td>
                                    <td><span className={`${styles.badge} ${badgeClass(d.status, styles)}`}>{labelStatus(d.status)}</span></td>
                                    <td className={styles.colAcao}>
                                        <button type="button" className={d.status === "pendente" ? styles.btnAnalisar : styles.btnVer} onClick={() => setAberto(`d-${d.id}`)}>
                                            {d.status === "pendente" ? "Analisar" : "Ver"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {listaD.length === 0 && linhaVazia(8)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal — retirada (mesmo conteúdo e regras do antigo card) */}
            {agenda && (() => {
                const chave = `r-${agenda.id}`;
                const pendente = agenda.status === "pendente";
                const situacoes = agenda.itensSolicitados.map(i => situacao(agenda, i));
                const bloqueado = situacoes.some(s => s.bloqueia);
                const acimaCota = situacoes.some(s => s.texto === "Acima da cota" || s.texto === "Sem cota definida");
                return (
                    <div className={styles.backdrop} onClick={() => setAberto(null)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <span className={styles.modalCodigo}>{agenda.codigoAgendamento}</span>
                                    <h2>Retirada — {agenda.donatario}</h2>
                                    <span className={styles.modalSub}>
                                        Solicitado em {formatarData(agenda.dataSolicitacao)} · Agendado para {formatarData(agenda.dataAgendada)}
                                    </span>
                                </div>
                                <div className={styles.modalHeaderDireita}>
                                    <span className={`${styles.badge} ${badgeClass(agenda.status, styles)}`}>{labelStatus(agenda.status)}</span>
                                    <button type="button" className={styles.btnFechar} onClick={() => setAberto(null)} aria-label="Fechar"><X size={20} /></button>
                                </div>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.dadosGrid}>
                                    <p><strong>Nome:</strong> {agenda.donatario}</p>
                                    <p><strong>CPF:</strong> {agenda.cpf}</p>
                                    <p><strong>Telefone:</strong> {agenda.telefone}</p>
                                </div>

                                <div className={styles.itensSolicitados}>
                                    <h4>Itens solicitados</h4>
                                    <table className={styles.tabelaItens}>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Quantidade</th>
                                                <th>Disponível</th>
                                                <th>Saldo da cota no mês</th>
                                                {pendente && <th>Situação</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {agenda.itensSolicitados.map((it, i) => (
                                                <tr key={it.codigoProduto}>
                                                    <td>{it.item}</td>
                                                    <td>
                                                        {pendente ? (
                                                            <input
                                                                type="number"
                                                                aria-label={`Quantidade de ${it.item}`}
                                                                className={styles.inputQtd}
                                                                value={qtd(agenda, it)}
                                                                min={0}
                                                                onChange={e => {
                                                                    setQuantidades({ ...quantidades, [`${agenda.id}-${it.codigoProduto}`]: Number(e.target.value) });
                                                                    setErros({ ...erros, [chave]: "" });
                                                                }}
                                                            />
                                                        ) : `${it.quantidade} ${it.unidade}`}
                                                    </td>
                                                    <td>{agenda.status === "aprovado" ? "Reservado" : `${disponivel(it.codigoProduto)} ${it.unidade}`}</td>
                                                    <td>{textoCota(agenda, it.codigoProduto)}</td>
                                                    {pendente && (
                                                        <td><span className={`${styles.badge} ${situacoes[i].classe}`}>{situacoes[i].texto}</span></td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pendente && acimaCota && (
                                    <p className={styles.aviso}>
                                        Este pedido passa da cota do mês (ou o produto não tem cota para este donatário). Você pode aprovar mesmo assim; registre o motivo na observação.
                                    </p>
                                )}

                                <div className={styles.dataAlteracao}>
                                    <label>Data de retirada</label>
                                    <input
                                        type="date"
                                        aria-label="Data de retirada"
                                        disabled={!pendente}
                                        value={datas[chave] ?? agenda.dataAgendada}
                                        onChange={e => setDatas({ ...datas, [chave]: e.target.value })}
                                    />
                                </div>

                                {agenda.observacao && <p className={styles.motivo}><strong>Observação registrada:</strong> {agenda.observacao}</p>}
                                {pendente && campoObservacao(chave, "recusar")}
                                {erros[chave] && <p className={styles.msgErro}>{erros[chave]}</p>}
                            </div>
                            <div className={styles.modalFooter}>
                                {pendente && (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.btnAprovar}
                                            disabled={bloqueado}
                                            title={bloqueado ? "Há item sem estoque disponível" : undefined}
                                            onClick={() => aprovarR(agenda)}
                                        >
                                            Aprovar
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.btnRecusar}
                                            onClick={() => executar(chave, () => recusarRetirada(agenda.id, observacoes[chave] ?? ""), `Retirada ${agenda.codigoAgendamento} recusada.`)}
                                        >
                                            Recusar
                                        </button>
                                    </>
                                )}
                                {!pendente && (
                                    <button
                                        type="button"
                                        className={styles.btnReabrir}
                                        onClick={() => executar(chave, () => reabrirRetirada(agenda.id), `Retirada ${agenda.codigoAgendamento} reaberta.`)}
                                    >
                                        Reabrir Solicitação
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })()}

            {/* Modal — doação (mesmo conteúdo e regras do antigo card) */}
            {doacao && (() => {
                const chave = `d-${doacao.id}`;
                const pendente = doacao.status === "pendente";
                return (
                    <div className={styles.backdrop} onClick={() => setAberto(null)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <span className={styles.modalCodigo}>{doacao.codigoAgendamento}</span>
                                    <h2>Doação — {doacao.doador}</h2>
                                    <span className={styles.modalSub}>Previsto para {formatarData(doacao.dataProposta)}</span>
                                </div>
                                <div className={styles.modalHeaderDireita}>
                                    <span className={`${styles.badge} ${badgeClass(doacao.status, styles)}`}>{labelStatus(doacao.status)}</span>
                                    <button type="button" className={styles.btnFechar} onClick={() => setAberto(null)} aria-label="Fechar"><X size={20} /></button>
                                </div>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.dadosGrid}>
                                    <p><strong>Nome:</strong> {doacao.doador}</p>
                                    <p><strong>CPF/CNPJ:</strong> {doacao.cpfCnpj}</p>
                                    <p><strong>Telefone:</strong> {doacao.telefone}</p>
                                    <p><strong>Item:</strong> {doacao.item}</p>
                                    <p><strong>Quantidade estimada:</strong> {doacao.quantidade} {doacao.unidade}</p>
                                </div>

                                <div className={styles.dataAlteracao}>
                                    <label>Data de entrega</label>
                                    <input
                                        type="date"
                                        aria-label="Data de entrega"
                                        disabled={!pendente}
                                        value={datas[chave] ?? doacao.dataProposta}
                                        onChange={e => setDatas({ ...datas, [chave]: e.target.value })}
                                    />
                                </div>

                                {doacao.observacao && <p className={styles.motivo}><strong>Observação registrada:</strong> {doacao.observacao}</p>}
                                {pendente && campoObservacao(chave, "recusar")}
                                {erros[chave] && <p className={styles.msgErro}>{erros[chave]}</p>}
                            </div>
                            <div className={styles.modalFooter}>
                                {pendente && (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.btnAprovar}
                                            onClick={() => executar(chave, () => aprovarDoacao(doacao.id, datas[chave] ?? doacao.dataProposta, observacoes[chave] ?? ""), `Doação ${doacao.codigoAgendamento} confirmada.`)}
                                        >
                                            Confirmar Agendamento
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.btnRecusar}
                                            onClick={() => executar(chave, () => recusarDoacao(doacao.id, observacoes[chave] ?? ""), `Doação ${doacao.codigoAgendamento} recusada.`)}
                                        >
                                            Recusar
                                        </button>
                                    </>
                                )}
                                {!pendente && (
                                    <button
                                        type="button"
                                        className={styles.btnReabrir}
                                        onClick={() => executar(chave, () => reabrirDoacao(doacao.id), `Doação ${doacao.codigoAgendamento} reaberta.`)}
                                    >
                                        Reabrir Solicitação
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                );
            })()}
        </>
    );
};
