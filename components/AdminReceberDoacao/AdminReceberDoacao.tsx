"use client";
import { useEffect, useState } from "react";
import styles from "./AdminReceberDoacao.module.css";
import { IAdminDoacaoAgendada } from "../../interfaces/adminDoacaoAgendada.interface";
import { IAdminProduto } from "../../interfaces/adminProduto.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { buscarDoacoesAgendadas, confirmarRecebimento, recusarRecebimento } from "../../services/doacoes.service";
import { buscarProdutos } from "../../services/produtos.service";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import { loteCorrespondente, statusValidade } from "../../utils/estoqueUtils";
import { AdminCampoBusca, IOpcaoBusca } from "../AdminCampoBusca/AdminCampoBusca";

// Linha editável do modal: o item agendado vem preenchido, os extras são adicionados pelo funcionário
interface IItemRecebimento {
    chave: number;
    codigoProduto: string;
    loteFabricante: string;
    validade: string;
    quantidade: number;
    agendado: boolean;
}

export function AdminReceberDoacao() {
    const [doacoesPendentes, setDoacoesPendentes] = useState<IAdminDoacaoAgendada[]>([]);
    const [resultado, setResultado] = useState<IAdminDoacaoAgendada[]>([]);
    const [produtos, setProdutos] = useState<IAdminProduto[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    const [filtroData, setFiltroData] = useState("");
    const [filtroDoador, setFiltroDoador] = useState("");
    const [mensagem, setMensagem] = useState("");

    // Estado do modal
    const [selecionada, setSelecionada] = useState<IAdminDoacaoAgendada | null>(null);
    const [itens, setItens] = useState<IItemRecebimento[]>([]);
    const [observacao, setObservacao] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        buscarDoacoesAgendadas().then(dados => {
            setDoacoesPendentes(dados);
            setResultado(dados);
        });
        buscarProdutos().then(setProdutos);
        buscarEstoque().then(setEstoque);
    }, []);

    function filtrar() {
        setResultado(doacoesPendentes.filter(d =>
            (!filtroData || d.dataAgendada === filtroData) &&
            (!filtroDoador || d.nomeDoador.toLowerCase().includes(filtroDoador.toLowerCase()))
        ));
    }

    function abrirModal(doacao: IAdminDoacaoAgendada) {
        setSelecionada(doacao);
        setItens([{ chave: 1, codigoProduto: doacao.codigoProduto, loteFabricante: "", validade: "", quantidade: doacao.quantidade, agendado: true }]);
        setObservacao("");
        setErro("");
    }

    function fecharModal() {
        setSelecionada(null);
    }

    function adicionarItem() {
        const chave = Math.max(0, ...itens.map(i => i.chave)) + 1;
        setItens([...itens, { chave, codigoProduto: produtos[0]?.codigo ?? "", loteFabricante: "", validade: "", quantidade: 1, agendado: false }]);
    }

    function alterarItem(chave: number, campos: Partial<IItemRecebimento>) {
        setErro("");
        setItens(itens.map(i => i.chave === chave ? { ...i, ...campos } : i));
    }

    function removerItem(chave: number) {
        setItens(itens.filter(i => i.chave !== chave));
    }

    function produto(codigo: string) {
        return produtos.find(p => p.codigo === codigo);
    }

    function lotesDoProduto(codigo: string) {
        return estoque.find(e => e.codigo === codigo)?.lotes ?? [];
    }

    // Sugestões: lotes do fabricante já existentes para o produto (fora os vencidos)
    function opcoesLote(codigo: string): IOpcaoBusca[] {
        return lotesDoProduto(codigo)
            .filter(l => l.loteFabricante && statusValidade(l.validade) !== "vencido")
            .map(l => ({
                valor: l.loteFabricante!,
                rotulo: l.loteFabricante!,
                detalhe: `Lote interno ${l.lote} · vence ${formatarData(l.validade)} · saldo ${l.saldoEstoque}`,
            }));
    }

    // Ao escolher um lote existente, a validade vem junto
    function escolherLote(chave: number, codigo: string, opcao: IOpcaoBusca) {
        const lote = lotesDoProduto(codigo).find(l => l.loteFabricante === opcao.valor);
        alterarItem(chave, { loteFabricante: opcao.valor, validade: lote?.validade ?? "" });
    }

    // Prévia do lote interno: soma num existente ou um novo será gerado
    function previaLoteInterno(item: IItemRecebimento) {
        const existente = loteCorrespondente(lotesDoProduto(item.codigoProduto), item.loteFabricante, item.validade);
        if (existente) return `Soma ao lote interno ${existente.lote}`;
        if (item.loteFabricante && !item.validade) return "Informe a validade";
        return "Novo lote interno será gerado ao confirmar";
    }

    // Tira a doação concluída das listas e mostra o aviso
    function concluir(texto: string) {
        if (!selecionada) return;
        const id = selecionada.id;
        setDoacoesPendentes(lista => lista.filter(d => d.id !== id));
        setResultado(lista => lista.filter(d => d.id !== id));
        buscarEstoque().then(setEstoque);
        setSelecionada(null);
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 6000);
    }

    async function confirmar() {
        if (!selecionada) return;
        try {
            const usados = await confirmarRecebimento(selecionada.id, itens, observacao);
            const lotes = usados.map(u => `${u.nome}: ${u.lote}${u.novo ? " (novo)" : ""}`).join(" · ");
            concluir(`Recebimento ${selecionada.codigoAgendamento} confirmado. Lotes internos — ${lotes}`);
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    async function recusar() {
        if (!selecionada) return;
        try {
            await recusarRecebimento(selecionada.id, observacao);
            concluir(`Recebimento ${selecionada.codigoAgendamento} recusado.`);
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    return (
        <>
            {mensagem && <p className={styles.msgSucesso}>{mensagem}</p>}

            <div className={styles.filtros}>
                <div>
                    <label>Data agendada</label>
                    <input type="date" aria-label="Filtrar por data" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
                </div>
                <div>
                    <label>Doador</label>
                    <input placeholder="Nome do doador..." value={filtroDoador} onChange={e => setFiltroDoador(e.target.value)} />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={filtrar}>Filtrar</button>
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Cód. Agendamento</th>
                        <th>Doador</th>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Data agendada</th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.map(doacao => (
                        <tr key={doacao.id} onClick={() => abrirModal(doacao)}>
                            <td>{doacao.codigoAgendamento}</td>
                            <td>{doacao.nomeDoador}</td>
                            <td>{doacao.item}</td>
                            <td>{doacao.quantidade}</td>
                            <td>{formatarData(doacao.dataAgendada)}</td>
                        </tr>
                    ))}
                    {resultado.length === 0 && (
                        <tr>
                            <td colSpan={5} className={styles.semResultados}>Nenhuma doação aguardando recebimento.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selecionada && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Detalhes da Doação</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Cód. Agendamento</span>
                                <span>{selecionada.codigoAgendamento}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Doador</span>
                                <span>{selecionada.nomeDoador}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF / CNPJ</span>
                                <span>{selecionada.cpfCnpj}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionada.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Data agendada</span>
                                <span>{formatarData(selecionada.dataAgendada)}</span>
                            </div>

                            <p className={styles.itensLabel}>Itens do recebimento</p>

                            <div className={styles.itensCabecalho}>
                                <span>Produto</span>
                                <span>Lote do fabricante</span>
                                <span>Validade</span>
                                <span>Qtd.</span>
                                <span></span>
                            </div>

                            {itens.map(item => (
                                <div key={item.chave} className={styles.itemBloco}>
                                    <div className={styles.itemGrade}>
                                        {item.agendado ? (
                                            <span className={styles.itemNome}>{produto(item.codigoProduto)?.nome ?? selecionada.item}</span>
                                        ) : (
                                            <select
                                                aria-label="Produto"
                                                className={styles.addItemSelect}
                                                value={item.codigoProduto}
                                                onChange={e => alterarItem(item.chave, { codigoProduto: e.target.value, loteFabricante: "", validade: "" })}
                                            >
                                                {produtos.map(p => (
                                                    <option key={p.codigo} value={p.codigo}>{p.nome}</option>
                                                ))}
                                            </select>
                                        )}
                                        <AdminCampoBusca
                                            ariaLabel="Lote do fabricante"
                                            placeholder="Opcional"
                                            textoLivre
                                            value={item.loteFabricante}
                                            opcoes={opcoesLote(item.codigoProduto)}
                                            onChange={valor => alterarItem(item.chave, { loteFabricante: valor })}
                                            onSelecionar={opcao => escolherLote(item.chave, item.codigoProduto, opcao)}
                                        />
                                        <input
                                            type="date"
                                            aria-label="Validade"
                                            className={styles.inputValidade}
                                            value={item.validade}
                                            onChange={e => alterarItem(item.chave, { validade: e.target.value })}
                                        />
                                        <span className={styles.itemQtdWrapper}>
                                            <input
                                                type="number"
                                                aria-label="Quantidade"
                                                className={styles.inputQtd}
                                                value={item.quantidade}
                                                min={0}
                                                onChange={e => alterarItem(item.chave, { quantidade: Number(e.target.value) })}
                                            />
                                            <span className={styles.unidade}>{produto(item.codigoProduto)?.unidade ?? "kg"}</span>
                                        </span>
                                        <button
                                            type="button"
                                            className={styles.btnRemover}
                                            onClick={() => removerItem(item.chave)}
                                            aria-label="Remover item"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <span className={styles.previaLote}>{previaLoteInterno(item)}</span>
                                </div>
                            ))}

                            <button type="button" className={styles.btnMostrarAdd} onClick={adicionarItem}>
                                + Adicionar produto
                            </button>

                            <div>
                                <label className={styles.obsLabel}>Observações</label>
                                <textarea
                                    className={styles.obsTextarea}
                                    placeholder="Observações sobre o recebimento (obrigatório para recusar)..."
                                    value={observacao}
                                    onChange={e => setObservacao(e.target.value)}
                                />
                            </div>

                            {erro && <p className={styles.msgErro}>{erro}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFecharFooter} onClick={fecharModal}>Fechar</button>
                            <button type="button" className={styles.btnRecusar} onClick={recusar}>Recusar Recebimento</button>
                            <button type="button" className={styles.btnConfirmar} onClick={confirmar}>Confirmar Recebimento</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
