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

export const AdminGerenciarAgendas = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");
    // Card aberto: "r-15" (retirada) ou "d-12" (doação)
    const [expandido, setExpandido] = useState<string | null>(null);
    const [mensagem, setMensagem] = useState("");

    const [retiradas, setRetiradas] = useState<IAdminAgenda[]>([]);
    const [doacoes, setDoacoes] = useState<IAdminAgendaDoacao[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);

    // Filtros — retiradas
    const [filtroStatusR, setFiltroStatusR] = useState("");
    const [filtroNomeR, setFiltroNomeR] = useState("");
    const [filtroDataR, setFiltroDataR] = useState("");
    const [resultadoR, setResultadoR] = useState<IAdminAgenda[]>([]);

    // Filtros — doações
    const [filtroStatusD, setFiltroStatusD] = useState("");
    const [filtroNomeD, setFiltroNomeD] = useState("");
    const [filtroDataD, setFiltroDataD] = useState("");
    const [resultadoD, setResultadoD] = useState<IAdminAgendaDoacao[]>([]);

    // Edições ainda não gravadas, por card ("r-15", "d-12")
    const [datas, setDatas] = useState<Record<string, string>>({});
    const [quantidades, setQuantidades] = useState<Record<string, number>>({}); // chave: "15-RC001"
    const [observacoes, setObservacoes] = useState<Record<string, string>>({});
    const [erros, setErros] = useState<Record<string, string>>({});

    const filtrarR = (lista: IAdminAgenda[]) => lista.filter(r =>
        (!filtroStatusR || r.status === filtroStatusR) &&
        (!filtroNomeR || r.donatario.toLowerCase().includes(filtroNomeR.toLowerCase())) &&
        (!filtroDataR || r.dataAgendada === filtroDataR)
    );

    const filtrarD = (lista: IAdminAgendaDoacao[]) => lista.filter(d =>
        (!filtroStatusD || d.status === filtroStatusD) &&
        (!filtroNomeD || d.doador.toLowerCase().includes(filtroNomeD.toLowerCase())) &&
        (!filtroDataD || d.dataProposta === filtroDataD)
    );

    // Busca tudo de novo nos services (depois de cada decisão, cotas e estoque mudam)
    async function recarregar(aplicarFiltros: boolean) {
        const [r, d, e] = await Promise.all([buscarSolicitacoesRetirada(), buscarSolicitacoesDoacao(), buscarEstoque()]);
        setRetiradas(r);
        setDoacoes(d);
        setEstoque(e);
        setResultadoR(aplicarFiltros ? filtrarR(r) : r);
        setResultadoD(aplicarFiltros ? filtrarD(d) : d);
    }

    useEffect(() => {
        Promise.all([buscarSolicitacoesRetirada(), buscarSolicitacoesDoacao(), buscarEstoque()]).then(([r, d, e]) => {
            setRetiradas(r);
            setResultadoR(r);
            setDoacoes(d);
            setResultadoD(d);
            setEstoque(e);
        });
    }, []);

    function toggleCard(chave: string) {
        setExpandido(expandido === chave ? null : chave);
    }

    function trocarAba(nova: "retiradas" | "doacoes") {
        setAba(nova);
        setExpandido(null);
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
            await recarregar(true);
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

    return (
        <div>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.abas}>
                <button type="button" className={aba === "retiradas" ? styles.abaAtiva : styles.aba} onClick={() => trocarAba("retiradas")}>
                    Retiradas (Donatário)
                </button>
                <button type="button" className={aba === "doacoes" ? styles.abaAtiva : styles.aba} onClick={() => trocarAba("doacoes")}>
                    Doações (Doador)
                </button>
            </div>

            {aba === "retiradas" && (
                <>
                    <div className={styles.filtros}>
                        <div>
                            <label>Status</label>
                            <select aria-label="Filtrar por status" value={filtroStatusR} onChange={e => setFiltroStatusR(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="pendente">Pendente</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="recusado">Recusado</option>
                            </select>
                        </div>
                        <div>
                            <label>Donatário</label>
                            <input placeholder="Nome..." value={filtroNomeR} onChange={e => setFiltroNomeR(e.target.value)} />
                        </div>
                        <div>
                            <label>Data agendada</label>
                            <input type="date" aria-label="Filtrar por data agendada" value={filtroDataR} onChange={e => setFiltroDataR(e.target.value)} />
                        </div>
                        <button type="button" className={styles.btnFiltrar} onClick={() => { setResultadoR(filtrarR(retiradas)); setExpandido(null); }}>Filtrar</button>
                    </div>

                    <div className={styles.lista}>
                        {resultadoR.map(agenda => {
                            const chave = `r-${agenda.id}`;
                            const pendente = agenda.status === "pendente";
                            const resumo = agenda.itensSolicitados.length === 1
                                ? agenda.itensSolicitados[0].item
                                : `${agenda.itensSolicitados.length} itens solicitados`;
                            const situacoes = agenda.itensSolicitados.map(i => situacao(agenda, i));
                            const bloqueado = situacoes.some(s => s.bloqueia);
                            const acimaCota = situacoes.some(s => s.texto === "Acima da cota" || s.texto === "Sem cota definida");

                            return (
                                <div key={chave} className={styles.card}>
                                    <div className={styles.cardHeader} onClick={() => toggleCard(chave)}>
                                        <div className={styles.cardHeaderInfo}>
                                            <strong>{agenda.donatario}</strong>
                                            <span>
                                                {agenda.codigoAgendamento} · Solicitado em {formatarData(agenda.dataSolicitacao)} · Agendado para {formatarData(agenda.dataAgendada)} — {resumo}
                                            </span>
                                        </div>
                                        <span className={`${styles.badge} ${badgeClass(agenda.status, styles)}`}>
                                            {labelStatus(agenda.status)}
                                        </span>
                                    </div>

                                    {expandido === chave && (
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
                                                                    ) : `${it.quantidade} kg`}
                                                                </td>
                                                                <td>{agenda.status === "aprovado" ? "Reservado" : `${disponivel(it.codigoProduto)} kg`}</td>
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

                                            <div className={styles.acoes}>
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
                                    )}
                                </div>
                            );
                        })}
                        {resultadoR.length === 0 && <p className={styles.semResultados}>Nenhum pedido encontrado.</p>}
                    </div>
                </>
            )}

            {aba === "doacoes" && (
                <>
                    <div className={styles.filtros}>
                        <div>
                            <label>Status</label>
                            <select aria-label="Filtrar por status" value={filtroStatusD} onChange={e => setFiltroStatusD(e.target.value)}>
                                <option value="">Todos</option>
                                <option value="pendente">Pendente</option>
                                <option value="aprovado">Aprovado</option>
                                <option value="recusado">Recusado</option>
                            </select>
                        </div>
                        <div>
                            <label>Doador</label>
                            <input placeholder="Nome..." value={filtroNomeD} onChange={e => setFiltroNomeD(e.target.value)} />
                        </div>
                        <div>
                            <label>Data</label>
                            <input type="date" aria-label="Filtrar por data" value={filtroDataD} onChange={e => setFiltroDataD(e.target.value)} />
                        </div>
                        <button type="button" className={styles.btnFiltrar} onClick={() => { setResultadoD(filtrarD(doacoes)); setExpandido(null); }}>Filtrar</button>
                    </div>

                    <div className={styles.lista}>
                        {resultadoD.map(doacao => {
                            const chave = `d-${doacao.id}`;
                            const pendente = doacao.status === "pendente";
                            return (
                                <div key={chave} className={styles.card}>
                                    <div className={styles.cardHeader} onClick={() => toggleCard(chave)}>
                                        <div className={styles.cardHeaderInfo}>
                                            <strong>{doacao.doador}</strong>
                                            <span>{doacao.codigoAgendamento} · Previsto para {formatarData(doacao.dataProposta)} — {doacao.item}</span>
                                        </div>
                                        <span className={`${styles.badge} ${badgeClass(doacao.status, styles)}`}>
                                            {labelStatus(doacao.status)}
                                        </span>
                                    </div>

                                    {expandido === chave && (
                                        <div className={styles.cardBody}>
                                            <div className={styles.dadosGrid}>
                                                <p><strong>Nome:</strong> {doacao.doador}</p>
                                                <p><strong>CPF/CNPJ:</strong> {doacao.cpfCnpj}</p>
                                                <p><strong>Telefone:</strong> {doacao.telefone}</p>
                                                <p><strong>Item:</strong> {doacao.item}</p>
                                                <p><strong>Quantidade estimada:</strong> {doacao.quantidade} kg</p>
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

                                            <div className={styles.acoes}>
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
                                    )}
                                </div>
                            );
                        })}
                        {resultadoD.length === 0 && <p className={styles.semResultados}>Nenhuma proposta encontrada.</p>}
                    </div>
                </>
            )}
        </div>
    );
};
