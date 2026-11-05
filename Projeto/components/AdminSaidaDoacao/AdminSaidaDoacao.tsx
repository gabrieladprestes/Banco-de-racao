"use client";
import { useEffect, useState } from "react";
import styles from "./AdminSaidaDoacao.module.css";
import { IAdminSaidaDoacao } from "../../interfaces/adminSaidaDoacao.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { buscarSaidasPendentes, cancelarEntrega, confirmarEntrega } from "../../services/retiradas.service";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import { disponivelParaLiberar, lotesParaSaida, sugerirLotesSaida, textoLoteFabricante } from "../../utils/estoqueUtils";
import { AdminCampoBusca, IOpcaoBusca } from "../AdminCampoBusca/AdminCampoBusca";

// Uma linha "lote + quantidade" dentro de um item da entrega
interface ILinhaLote {
    chave: number;
    lote: string;
    quantidade: number;
}

export function AdminSaidaDoacao() {
    const [saidasPendentes, setSaidasPendentes] = useState<IAdminSaidaDoacao[]>([]);
    const [resultado, setResultado] = useState<IAdminSaidaDoacao[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    const [filtroData, setFiltroData] = useState("");
    const [filtroDonatario, setFiltroDonatario] = useState("");
    const [mensagem, setMensagem] = useState("");

    // Estado do modal: linhas de lote por código de produto
    const [selecionada, setSelecionada] = useState<IAdminSaidaDoacao | null>(null);
    const [linhas, setLinhas] = useState<Record<string, ILinhaLote[]>>({});
    const [observacao, setObservacao] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        buscarSaidasPendentes().then(dados => {
            setSaidasPendentes(dados);
            setResultado(dados);
        });
        buscarEstoque().then(setEstoque);
    }, []);

    function filtrar() {
        setResultado(saidasPendentes.filter(s =>
            (!filtroData || s.dataAgendada === filtroData) &&
            (!filtroDonatario || s.nomeDonatario.toLowerCase().includes(filtroDonatario.toLowerCase()))
        ));
    }

    function lotesDoProduto(codigo: string) {
        return estoque.find(e => e.codigo === codigo)?.lotes ?? [];
    }

    // O que esta retirada pode levar: o disponível + a reserva que já é dela (o solicitado)
    function limiteEntrega(codigo: string, solicitado: number) {
        return disponivelParaLiberar(lotesDoProduto(codigo)) + solicitado;
    }

    // Abre já com a sugestão: lotes que vencem primeiro, até completar o solicitado
    function abrirModal(saida: IAdminSaidaDoacao) {
        let chave = 0;
        const sugestao: Record<string, ILinhaLote[]> = {};
        saida.itens.forEach(item => {
            const lotes = lotesDoProduto(item.codigoProduto);
            const quantidade = Math.min(item.quantidadeSolicitada, limiteEntrega(item.codigoProduto, item.quantidadeSolicitada));
            sugestao[item.codigoProduto] = sugerirLotesSaida(lotes, quantidade).map(s => ({ chave: ++chave, ...s }));
        });
        setSelecionada(saida);
        setLinhas(sugestao);
        setObservacao("");
        setErro("");
    }

    function fecharModal() {
        setSelecionada(null);
    }

    function alterarLinha(codigo: string, chave: number, campos: Partial<ILinhaLote>) {
        setErro("");
        setLinhas({ ...linhas, [codigo]: linhas[codigo].map(l => l.chave === chave ? { ...l, ...campos } : l) });
    }

    function removerLinha(codigo: string, chave: number) {
        setErro("");
        setLinhas({ ...linhas, [codigo]: linhas[codigo].filter(l => l.chave !== chave) });
    }

    // Nova linha: próximo lote ainda não usado, com o que falta para completar o solicitado
    function adicionarLinha(codigo: string, solicitado: number) {
        const atuais = linhas[codigo] ?? [];
        const usados = new Set(atuais.map(l => l.lote));
        const proximo = lotesParaSaida(lotesDoProduto(codigo)).find(l => !usados.has(l.lote));
        const falta = Math.max(solicitado - totalItem(codigo), 0);
        const chave = Math.max(0, ...Object.values(linhas).flat().map(l => l.chave)) + 1;
        setLinhas({
            ...linhas,
            [codigo]: [...atuais, { chave, lote: proximo?.lote ?? "", quantidade: proximo ? Math.min(falta, proximo.saldoEstoque) : 0 }],
        });
    }

    function totalItem(codigo: string) {
        return (linhas[codigo] ?? []).reduce((acc, l) => acc + (l.quantidade || 0), 0);
    }

    // Opções de lote: só os válidos com saldo, do que vence primeiro ao último.
    // Um lote já escolhido em outra linha do mesmo item não aparece de novo.
    function opcoesLote(codigo: string, chaveAtual: number): IOpcaoBusca[] {
        const usadosEmOutras = new Set((linhas[codigo] ?? []).filter(l => l.chave !== chaveAtual).map(l => l.lote));
        return lotesParaSaida(lotesDoProduto(codigo))
            .filter(l => !usadosEmOutras.has(l.lote))
            .map((l, i) => ({
                valor: l.lote,
                rotulo: l.lote,
                detalhe: `Fabricante ${textoLoteFabricante(l.loteFabricante)} · vence ${formatarData(l.validade)} · saldo ${l.saldoEstoque}${i === 0 ? " · vence primeiro" : ""}`,
            }));
    }

    function saldoDoLote(codigo: string, lote: string) {
        return lotesDoProduto(codigo).find(l => l.lote === lote)?.saldoEstoque;
    }

    // Texto de conferência do lote escolhido (para bater com a etiqueta do saco)
    function infoDoLote(codigo: string, lote: string) {
        const l = lotesDoProduto(codigo).find(x => x.lote === lote);
        if (!l) return "Nenhum lote escolhido";
        return `Fabricante ${textoLoteFabricante(l.loteFabricante)} · vence ${formatarData(l.validade)} · saldo ${l.saldoEstoque}`;
    }

    function resumoItens(saida: IAdminSaidaDoacao) {
        return saida.itens.map(i => `${i.item} (${i.quantidadeSolicitada} kg)`).join(", ");
    }

    // Tira a retirada concluída das listas, recarrega o estoque e mostra o aviso
    function concluir(texto: string) {
        if (!selecionada) return;
        const id = selecionada.id;
        setSaidasPendentes(lista => lista.filter(s => s.id !== id));
        setResultado(lista => lista.filter(s => s.id !== id));
        buscarEstoque().then(setEstoque);
        setSelecionada(null);
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 6000);
    }

    async function confirmar() {
        if (!selecionada) return;
        try {
            const itens = selecionada.itens.map(item => ({
                codigoProduto: item.codigoProduto,
                lotes: (linhas[item.codigoProduto] ?? [])
                    .filter(l => l.quantidade > 0)
                    .map(l => ({ lote: l.lote, quantidade: l.quantidade })),
            }));
            await confirmarEntrega(selecionada.id, itens, observacao);
            concluir(`Entrega ${selecionada.codigoAgendamento} confirmada. O estoque foi atualizado.`);
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    async function cancelar() {
        if (!selecionada) return;
        try {
            await cancelarEntrega(selecionada.id, observacao);
            concluir(`Entrega ${selecionada.codigoAgendamento} cancelada.`);
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
                    <input
                        type="date"
                        aria-label="Filtrar por data"
                        value={filtroData}
                        onChange={e => setFiltroData(e.target.value)}
                    />
                </div>
                <div>
                    <label>Donatário</label>
                    <input
                        placeholder="Nome do donatário..."
                        value={filtroDonatario}
                        onChange={e => setFiltroDonatario(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && filtrar()}
                    />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={filtrar}>Filtrar</button>
            </div>

            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Cód. Agendamento</th>
                        <th>Donatário</th>
                        <th>Itens</th>
                        <th>Data agendada</th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.map(saida => (
                        <tr key={saida.id} onClick={() => abrirModal(saida)}>
                            <td>{saida.codigoAgendamento}</td>
                            <td>{saida.nomeDonatario}</td>
                            <td>{resumoItens(saida)}</td>
                            <td>{formatarData(saida.dataAgendada)}</td>
                        </tr>
                    ))}
                    {resultado.length === 0 && (
                        <tr>
                            <td colSpan={4} className={styles.semResultados}>Nenhuma retirada aguardando entrega.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selecionada && (
                <div className={styles.backdrop} onClick={fecharModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Confirmar Saída de Doação</h2>
                            <button type="button" className={styles.btnFechar} onClick={fecharModal}>✕</button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.campo}>
                                <span>Cód. Agendamento</span>
                                <span>{selecionada.codigoAgendamento}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Donatário</span>
                                <span>{selecionada.nomeDonatario}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>CPF</span>
                                <span>{selecionada.cpf}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Telefone</span>
                                <span>{selecionada.telefone}</span>
                            </div>
                            <div className={styles.campo}>
                                <span>Data agendada</span>
                                <span>{formatarData(selecionada.dataAgendada)}</span>
                            </div>

                            <p className={styles.itensLabel}>Itens para entrega</p>
                            <p className={styles.dica}>Sugestão: lotes que vencem primeiro. Troque o lote ou divida entre lotes se precisar.</p>

                            {selecionada.itens.map(item => {
                                const codigo = item.codigoProduto;
                                const total = totalItem(codigo);
                                const saldo = limiteEntrega(codigo, item.quantidadeSolicitada);
                                return (
                                    <div key={codigo} className={styles.itemSaida}>
                                        <div className={styles.itemSaidaTopo}>
                                            <strong>{item.item}</strong>
                                            <span>
                                                Solicitado {item.quantidadeSolicitada} kg · Pode sair {saldo} kg · A entregar{" "}
                                                <strong className={total > item.quantidadeSolicitada ? styles.saldoBaixo : undefined}>{total} kg</strong>
                                            </span>
                                        </div>

                                        {(linhas[codigo] ?? []).map(linha => {
                                            const saldoLote = saldoDoLote(codigo, linha.lote);
                                            const excede = saldoLote !== undefined && linha.quantidade > saldoLote;
                                            return (
                                                <div key={linha.chave} className={styles.loteLinha}>
                                                    <AdminCampoBusca
                                                        ariaLabel={`Lote de ${item.item}`}
                                                        placeholder="Escolha o lote"
                                                        value={linha.lote}
                                                        opcoes={opcoesLote(codigo, linha.chave)}
                                                        onChange={valor => alterarLinha(codigo, linha.chave, { lote: valor })}
                                                        vazio="Nenhum lote disponível"
                                                    />
                                                    <span className={styles.loteQtd}>
                                                        <input
                                                            type="number"
                                                            aria-label={`Quantidade do lote ${linha.lote}`}
                                                            className={`${styles.inputQtd} ${excede ? styles.inputErro : ""}`}
                                                            value={linha.quantidade}
                                                            min={0}
                                                            onChange={e => alterarLinha(codigo, linha.chave, { quantidade: Number(e.target.value) })}
                                                        />
                                                        {" kg"}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={styles.btnRemover}
                                                        aria-label="Remover lote"
                                                        onClick={() => removerLinha(codigo, linha.chave)}
                                                    >
                                                        ✕
                                                    </button>
                                                    <span className={styles.loteInfo}>{infoDoLote(codigo, linha.lote)}</span>
                                                </div>
                                            );
                                        })}

                                        <button type="button" className={styles.btnMaisLote} onClick={() => adicionarLinha(codigo, item.quantidadeSolicitada)}>
                                            + outro lote
                                        </button>
                                    </div>
                                );
                            })}

                            <div>
                                <label className={styles.obsLabel}>Observações</label>
                                <textarea
                                    className={styles.obsTextarea}
                                    placeholder="Observações sobre a entrega (obrigatório para cancelar)..."
                                    value={observacao}
                                    onChange={e => setObservacao(e.target.value)}
                                />
                            </div>

                            {erro && <p className={styles.msgErro}>{erro}</p>}
                        </div>

                        <div className={styles.modalFooter}>
                            <button type="button" className={styles.btnFecharFooter} onClick={fecharModal}>Fechar</button>
                            <button type="button" className={styles.btnCancelar} onClick={cancelar}>Cancelar Entrega</button>
                            <button type="button" className={styles.btnConfirmar} onClick={confirmar}>Confirmar Entrega</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
