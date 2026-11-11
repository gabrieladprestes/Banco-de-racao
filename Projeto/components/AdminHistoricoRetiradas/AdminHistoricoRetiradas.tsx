"use client";
import { useEffect, useState } from "react";
import styles from "./AdminHistoricoRetiradas.module.css";
import { IAdminHistoricoItem, IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminHistoricoDoacao } from "../../interfaces/adminHistoricoDoacao.interface";
import { buscarHistoricoRetiradas } from "../../services/retiradas.service";
import { buscarHistoricoDoacoes } from "../../services/doacoes.service";
import { formatarData } from "../../utils/dateUtils";
import { textoLoteFabricante } from "../../utils/estoqueUtils";
import { somenteDigitos } from "../../utils/textoUtils";
import { PackageMinus, PackagePlus, X } from "lucide-react";

function resumoItens(itens: { nome: string; quantidade: number; unidade: string }[]) {
    return itens.map(i => `${i.nome} (${i.quantidade} ${i.unidade})`).join(", ");
}

interface IFiltro {
    busca: string;
    inicio: string;
    fim: string;
    origem: "" | "agendada" | "sem-agendamento";   // só nas doações
}
const FILTRO_VAZIO: IFiltro = { busca: "", inicio: "", fim: "", origem: "" };
const igual = (a: IFiltro, b: IFiltro) => JSON.stringify(a) === JSON.stringify(b);

// A busca aceita nome, CPF/CNPJ, código do agendamento, código ou nome do produto e lotes (interno ou do fabricante)
function bateBusca(termo: string, textos: (string | undefined)[], documento: string) {
    const t = termo.trim().toLowerCase();
    if (!t) return true;
    const digitos = somenteDigitos(termo);
    return textos.some(x => (x ?? "").toLowerCase().includes(t))
        || (digitos.length >= 3 && somenteDigitos(documento).includes(digitos));
}

const textosDosItens = (itens: IAdminHistoricoItem[]) => itens.flatMap(i => [i.codigo, i.nome, i.lote, i.loteFabricante]);
const noPeriodo = (data: string, f: IFiltro) => (!f.inicio || data >= f.inicio) && (!f.fim || data <= f.fim);

export const AdminHistoricoRetiradas = () => {
    const [aba, setAba] = useState<"retiradas" | "doacoes">("retiradas");

    const [retiradas, setRetiradas] = useState<IAdminHistoricoRetirada[]>([]);
    const [doacoes, setDoacoes] = useState<IAdminHistoricoDoacao[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros de cada aba: o que está nos campos e o que foi aplicado no Buscar
    const [camposR, setCamposR] = useState<IFiltro>(FILTRO_VAZIO);
    const [filtroR, setFiltroR] = useState<IFiltro>(FILTRO_VAZIO);
    const [camposD, setCamposD] = useState<IFiltro>(FILTRO_VAZIO);
    const [filtroD, setFiltroD] = useState<IFiltro>(FILTRO_VAZIO);

    const [retiradaSelecionada, setRetiradaSelecionada] = useState<IAdminHistoricoRetirada | null>(null);
    const [doacaoSelecionada, setDoacaoSelecionada] = useState<IAdminHistoricoDoacao | null>(null);

    useEffect(() => {
        // Mais recente primeiro
        Promise.all([buscarHistoricoRetiradas(), buscarHistoricoDoacoes()]).then(([r, d]) => {
            setRetiradas([...r].sort((a, b) => b.dataRetirada.localeCompare(a.dataRetirada)));
            setDoacoes([...d].sort((a, b) => b.dataRecebimento.localeCompare(a.dataRecebimento)));
            setCarregando(false);
        });
    }, []);

    const listaR = retiradas.filter(r =>
        noPeriodo(r.dataRetirada, filtroR) &&
        bateBusca(filtroR.busca, [r.donatario, r.codigoAgendamento, ...textosDosItens(r.itens)], r.cpf)
    );
    const listaD = doacoes.filter(d =>
        noPeriodo(d.dataRecebimento, filtroD) &&
        (!filtroD.origem || (filtroD.origem === "sem-agendamento") === !!d.semAgendamento) &&
        bateBusca(filtroD.busca, [d.doador, d.codigoAgendamento, ...textosDosItens(d.itens)], d.cpfCnpj)
    );

    const ehRetiradas = aba === "retiradas";
    const campos = ehRetiradas ? camposR : camposD;
    const setCampos = ehRetiradas ? setCamposR : setCamposD;
    const filtroAtual = ehRetiradas ? filtroR : filtroD;
    const temFiltro = !igual(campos, FILTRO_VAZIO) || !igual(filtroAtual, FILTRO_VAZIO);
    const total = ehRetiradas ? retiradas.length : doacoes.length;
    const mostrando = ehRetiradas ? listaR.length : listaD.length;

    function buscar() {
        if (ehRetiradas) setFiltroR(camposR);
        else setFiltroD(camposD);
    }

    function limpar() {
        setCampos(FILTRO_VAZIO);
        if (ehRetiradas) setFiltroR(FILTRO_VAZIO);
        else setFiltroD(FILTRO_VAZIO);
    }

    const linhaVazia = (colunas: number) => (
        <tr>
            <td colSpan={colunas} className={styles.semResultados}>
                {carregando ? "Carregando…" : temFiltro ? "Nenhum registro encontrado com esses filtros." : "Nenhum registro ainda."}
            </td>
        </tr>
    );

    return (
        <>
            <div className={styles.tabs} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={ehRetiradas}
                    className={`${styles.tab} ${ehRetiradas ? styles.tabAtivo : ""}`}
                    onClick={() => setAba("retiradas")}
                >
                    <PackageMinus size={18} aria-hidden /> Retiradas <span className={styles.tabSub}>entregues</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={!ehRetiradas}
                    className={`${styles.tab} ${!ehRetiradas ? styles.tabAtivo : ""}`}
                    onClick={() => setAba("doacoes")}
                >
                    <PackagePlus size={18} aria-hidden /> Doações <span className={styles.tabSub}>recebidas</span>
                </button>
            </div>

            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Busca</label>
                    <input
                        placeholder={ehRetiradas
                            ? "Donatário, CPF, código (RET-…), produto ou lote"
                            : "Doador, CPF/CNPJ, código (AG-…), produto ou lote"}
                        value={campos.busca}
                        onChange={e => setCampos({ ...campos, busca: e.target.value })}
                        onKeyDown={e => e.key === "Enter" && buscar()}
                    />
                </div>
                <div>
                    <label>De</label>
                    <input type="date" aria-label="Data inicial" value={campos.inicio} onChange={e => setCampos({ ...campos, inicio: e.target.value })} />
                </div>
                <div>
                    <label>Até</label>
                    <input type="date" aria-label="Data final" value={campos.fim} onChange={e => setCampos({ ...campos, fim: e.target.value })} />
                </div>
                {!ehRetiradas && (
                    <div>
                        <label>Origem</label>
                        <select
                            aria-label="Filtrar por origem"
                            value={campos.origem}
                            onChange={e => setCampos({ ...campos, origem: e.target.value as IFiltro["origem"] })}
                        >
                            <option value="">Todas</option>
                            <option value="agendada">Agendadas</option>
                            <option value="sem-agendamento">Sem agendamento</option>
                        </select>
                    </div>
                )}
                <button type="button" className={styles.btnBuscar} onClick={buscar}>Buscar</button>
                {temFiltro && <button type="button" className={styles.btnLimpar} onClick={limpar}>Limpar</button>}
            </div>

            {!carregando && (
                <p className={styles.contador}>
                    {mostrando === total
                        ? `${total} ${ehRetiradas ? "retiradas entregues" : "doações recebidas"}`
                        : `Mostrando ${mostrando} de ${total}`}
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
                                <th>Data</th>
                                <th>Responsável</th>
                                <th><span className={styles.somenteLeitor}>Detalhes</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaR.map(r => (
                                <tr key={r.id}>
                                    <td className={styles.nowrap}>{r.codigoAgendamento}</td>
                                    <td>{r.donatario}</td>
                                    <td className={styles.nowrap}>{r.cpf}</td>
                                    <td className={styles.tdItens}>{resumoItens(r.itens)}</td>
                                    <td className={styles.nowrap}>{formatarData(r.dataRetirada)}</td>
                                    <td>{r.responsavel}</td>
                                    <td className={styles.colAcao}>
                                        <button type="button" className={styles.btnVer} onClick={() => setRetiradaSelecionada(r)}>Ver itens</button>
                                    </td>
                                </tr>
                            ))}
                            {listaR.length === 0 && linhaVazia(7)}
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
                                <th>Itens</th>
                                <th>Data</th>
                                <th>Responsável</th>
                                <th><span className={styles.somenteLeitor}>Detalhes</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {listaD.map(d => (
                                <tr key={d.id}>
                                    <td className={styles.nowrap}>
                                        {d.codigoAgendamento}
                                        {d.semAgendamento && <span className={styles.tagSemAgendamento}>Sem agendamento</span>}
                                    </td>
                                    <td>
                                        {d.doador}
                                        {d.doadorNaoCadastrado && <span className={styles.tagNaoCadastrado}>Não cadastrado</span>}
                                    </td>
                                    <td className={styles.nowrap}>{d.cpfCnpj}</td>
                                    <td className={styles.tdItens}>{resumoItens(d.itens)}</td>
                                    <td className={styles.nowrap}>{formatarData(d.dataRecebimento)}</td>
                                    <td>{d.responsavel}</td>
                                    <td className={styles.colAcao}>
                                        <button type="button" className={styles.btnVer} onClick={() => setDoacaoSelecionada(d)}>Ver itens</button>
                                    </td>
                                </tr>
                            ))}
                            {listaD.length === 0 && linhaVazia(7)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal — retirada */}
            {retiradaSelecionada && (
                <div className={styles.backdrop} onClick={() => setRetiradaSelecionada(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalCodigo}>{retiradaSelecionada.codigoAgendamento}</span>
                                <h2>{retiradaSelecionada.donatario}</h2>
                            </div>
                            <button type="button" className={styles.btnFechar} onClick={() => setRetiradaSelecionada(null)} aria-label="Fechar"><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalInfo}>
                                <span><strong>CPF:</strong> {retiradaSelecionada.cpf}</span>
                                <span><strong>Data:</strong> {formatarData(retiradaSelecionada.dataRetirada)}</span>
                                <span><strong>Responsável:</strong> {retiradaSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote interno</th>
                                        <th>Lote fabricante</th>
                                        <th>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {retiradaSelecionada.itens.map((item, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.codPill}>{item.codigo}</span></td>
                                            <td>{item.nome}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.lote}</td>
                                            <td>{textoLoteFabricante(item.loteFabricante)}</td>
                                            <td>{item.quantidade} {item.unidade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — doação */}
            {doacaoSelecionada && (
                <div className={styles.backdrop} onClick={() => setDoacaoSelecionada(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <span className={styles.modalCodigo}>{doacaoSelecionada.codigoAgendamento}</span>
                                {doacaoSelecionada.semAgendamento && <span className={styles.tagSemAgendamento}>Sem agendamento</span>}
                                {doacaoSelecionada.doadorNaoCadastrado && <span className={styles.tagNaoCadastrado}>Não cadastrado</span>}
                                <h2>{doacaoSelecionada.doador}</h2>
                            </div>
                            <button type="button" className={styles.btnFechar} onClick={() => setDoacaoSelecionada(null)} aria-label="Fechar"><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalInfo}>
                                <span><strong>CPF / CNPJ:</strong> {doacaoSelecionada.cpfCnpj}</span>
                                <span><strong>Data:</strong> {formatarData(doacaoSelecionada.dataRecebimento)}</span>
                                <span><strong>Responsável:</strong> {doacaoSelecionada.responsavel}</span>
                            </div>
                            <table className={styles.tabelaDetalhe}>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Produto</th>
                                        <th>Tipo</th>
                                        <th>Lote interno</th>
                                        <th>Lote fabricante</th>
                                        <th>Quantidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doacaoSelecionada.itens.map((item, i) => (
                                        <tr key={i}>
                                            <td><span className={styles.codPill}>{item.codigo}</span></td>
                                            <td>{item.nome}</td>
                                            <td>{item.tipo}</td>
                                            <td>{item.lote}</td>
                                            <td>{textoLoteFabricante(item.loteFabricante)}</td>
                                            <td>{item.quantidade} {item.unidade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
