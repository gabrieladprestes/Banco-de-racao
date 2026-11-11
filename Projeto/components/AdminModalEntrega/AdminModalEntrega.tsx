"use client";
import { useEffect, useState } from "react";
import styles from "./AdminModalEntrega.module.css";
import { IAdminSaidaDoacao } from "../../interfaces/adminSaidaDoacao.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { cancelarEntrega, confirmarEntrega } from "../../services/retiradas.service";
import { buscarEstoque } from "../../services/estoque.service";
import { formatarData } from "../../utils/dateUtils";
import { disponivelParaLiberar, lotesParaSaida, sugerirLotesSaida, textoLoteFabricante } from "../../utils/estoqueUtils";
import { AdminCampoBusca, IOpcaoBusca } from "../AdminCampoBusca/AdminCampoBusca";
import { X } from "lucide-react";

// Modal de entrega de uma retirada aprovada.
// Usado na lista de retiradas para entregar e no card do donatário (Atendimento).

// Uma linha "lote + quantidade" dentro de um item da entrega
interface ILinhaLote {
    chave: number;
    lote: string;
    quantidade: number;
}

interface Props {
    saida: IAdminSaidaDoacao;
    onFechar: () => void;
    // Chamado depois de confirmar ou cancelar, com o texto do aviso para a tela
    onConcluido: (mensagem: string) => void;
}

const lotesDe = (estoque: IAdminEstoque[], codigo: string) => estoque.find(e => e.codigo === codigo)?.lotes ?? [];

// O que esta retirada pode levar: o disponível + a reserva que já é dela (o solicitado)
const limiteDe = (estoque: IAdminEstoque[], codigo: string, solicitado: number) =>
    disponivelParaLiberar(lotesDe(estoque, codigo)) + solicitado;

export function AdminModalEntrega({ saida, onFechar, onConcluido }: Props) {
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);
    // Linhas de lote por código de produto
    const [linhas, setLinhas] = useState<Record<string, ILinhaLote[]>>({});
    const [observacao, setObservacao] = useState("");
    const [erro, setErro] = useState("");

    // Abre já com a sugestão: lotes que vencem primeiro, até completar o solicitado
    useEffect(() => {
        buscarEstoque().then(dados => {
            let chave = 0;
            const sugestao: Record<string, ILinhaLote[]> = {};
            saida.itens.forEach(item => {
                const quantidade = Math.min(item.quantidadeSolicitada, limiteDe(dados, item.codigoProduto, item.quantidadeSolicitada));
                sugestao[item.codigoProduto] = sugerirLotesSaida(lotesDe(dados, item.codigoProduto), quantidade).map(s => ({ chave: ++chave, ...s }));
            });
            setEstoque(dados);
            setLinhas(sugestao);
        });
    }, [saida]);

    const lotesDoProduto = (codigo: string) => lotesDe(estoque, codigo);
    const limiteEntrega = (codigo: string, solicitado: number) => limiteDe(estoque, codigo, solicitado);

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

    async function confirmar() {
        try {
            const itens = saida.itens.map(item => ({
                codigoProduto: item.codigoProduto,
                lotes: (linhas[item.codigoProduto] ?? [])
                    .filter(l => l.quantidade > 0)
                    .map(l => ({ lote: l.lote, quantidade: l.quantidade })),
            }));
            await confirmarEntrega(saida.id, itens, observacao);
            onConcluido(`Entrega ${saida.codigoAgendamento} confirmada. O estoque foi atualizado.`);
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    async function cancelar() {
        try {
            await cancelarEntrega(saida.id, observacao);
            onConcluido(`Entrega ${saida.codigoAgendamento} cancelada.`);
        } catch (e) {
            setErro((e as Error).message);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onFechar}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Confirmar Saída de Doação</h2>
                    <button type="button" className={styles.btnFechar} onClick={onFechar} aria-label="Fechar"><X size={20} /></button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.campo}>
                        <span>Cód. Agendamento</span>
                        <span>{saida.codigoAgendamento}</span>
                    </div>
                    <div className={styles.campo}>
                        <span>Donatário</span>
                        <span>{saida.nomeDonatario}</span>
                    </div>
                    <div className={styles.campo}>
                        <span>CPF</span>
                        <span>{saida.cpf}</span>
                    </div>
                    <div className={styles.campo}>
                        <span>Telefone</span>
                        <span>{saida.telefone}</span>
                    </div>
                    <div className={styles.campo}>
                        <span>Data agendada</span>
                        <span>{formatarData(saida.dataAgendada)}</span>
                    </div>

                    <p className={styles.itensLabel}>Itens para entrega</p>
                    <p className={styles.dica}>Sugestão: lotes que vencem primeiro. Troque o lote ou divida entre lotes se precisar.</p>

                    {saida.itens.map(item => {
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
                                                <X size={16} />
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
                    <button type="button" className={styles.btnFecharFooter} onClick={onFechar}>Fechar</button>
                    <button type="button" className={styles.btnCancelar} onClick={cancelar}>Cancelar Entrega</button>
                    <button type="button" className={styles.btnConfirmar} onClick={confirmar}>Confirmar Entrega</button>
                </div>
            </div>
        </div>
    );
}
