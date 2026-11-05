"use client";
import { useEffect, useState } from "react";
import styles from "./AdminAtendimento.module.css";
import { IAdminDonatario } from "../../interfaces/adminDonatario.interface";
import { IAdminEstoque } from "../../interfaces/adminEstoque.interface";
import { IAdminHistoricoRetirada } from "../../interfaces/adminHistoricoRetirada.interface";
import { IAdminCotaProduto } from "../../interfaces/adminAtendimento.interface";
import { COTA_MENSAL_KG, calcularCotas } from "../../services/atendimento.service";
import { buscarDonatarios } from "../../services/donatarios.service";
import { buscarEstoque } from "../../services/estoque.service";
import { buscarAprovadosDoMes, buscarRetiradasDoMes } from "../../services/retiradas.service";
import { IAdminSolicitacaoItem } from "../../interfaces/adminSolicitacao.interface";
import { disponivelParaLiberar, statusGeral } from "../../utils/estoqueUtils";
import { formatarData } from "../../utils/dateUtils";

const mesAtual = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

function statusCota(cota: IAdminCotaProduto) {
    if (cota.liberado > 0) return { texto: `Liberado ${cota.liberado} kg`, classe: styles.badgeBom };
    if (cota.saldoCota === 0) return { texto: "Cota esgotada", classe: styles.badgeVencido };
    return { texto: "Sem estoque", classe: styles.badgeVencendo };
}

export function AdminAtendimento() {
    const [busca, setBusca] = useState("");
    const [encontrados, setEncontrados] = useState<IAdminDonatario[] | null>(null);
    const [selecionado, setSelecionado] = useState<IAdminDonatario | null>(null);
    const [retiradasMes, setRetiradasMes] = useState<IAdminHistoricoRetirada[]>([]);
    const [aprovadosMes, setAprovadosMes] = useState<IAdminSolicitacaoItem[]>([]);
    const [estoque, setEstoque] = useState<IAdminEstoque[]>([]);

    useEffect(() => {
        buscarEstoque().then(setEstoque);
    }, []);

    async function selecionar(donatario: IAdminDonatario) {
        setSelecionado(donatario);
        setRetiradasMes(await buscarRetiradasDoMes(donatario.cpf));
        setAprovadosMes(await buscarAprovadosDoMes(donatario.cpf));
    }

    async function pesquisar() {
        if (!busca.trim()) return;
        const lista = await buscarDonatarios(busca);
        setEncontrados(lista);
        setSelecionado(null);
        if (lista.length === 1) await selecionar(lista[0]);
    }

    const cotas = selecionado ? calcularCotas(selecionado.pets, retiradasMes, aprovadosMes, estoque) : [];
    const totalRetirado = retiradasMes.flatMap(r => r.itens).reduce((acc, i) => acc + i.quantidade, 0);

    return (
        <>
            <div className={styles.filtros}>
                <div className={styles.campoBusca}>
                    <label>Donatário</label>
                    <input
                        placeholder="Buscar por CPF ou nome..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && pesquisar()}
                    />
                </div>
                <button type="button" className={styles.btnBuscar} onClick={pesquisar}>Buscar</button>
            </div>

            {encontrados && encontrados.length === 0 && (
                <p className={styles.aviso}>Nenhum donatário encontrado.</p>
            )}

            {encontrados && encontrados.length > 1 && (
                <table className={`${styles.tabela} ${styles.tabelaSelecao}`}>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {encontrados.map(d => (
                            <tr
                                key={d.id}
                                className={selecionado?.id === d.id ? styles.linhaSelecionada : ""}
                                onClick={() => selecionar(d)}
                            >
                                <td>{d.nome}</td>
                                <td>{d.cpf}</td>
                                <td>{d.telefone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                            <h3>Liberação</h3>
                            <table className={styles.tabelaInterna}>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Cota do mês</th>
                                        <th>Retirado</th>
                                        <th>Aprovado a retirar</th>
                                        <th>Saldo da cota</th>
                                        <th>Disponível em estoque</th>
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
                                                <td>{cota.disponivelEstoque} kg</td>
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

            <h3 className={styles.tituloEstoque}>Estoque disponível</h3>
            <table className={styles.tabela}>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Item</th>
                        <th>Tipo</th>
                        <th>Disponível p/ liberar</th>
                        <th>Validade</th>
                    </tr>
                </thead>
                <tbody>
                    {estoque.map(item => {
                        const sg = statusGeral(item.lotes);
                        return (
                            <tr key={item.id}>
                                <td>{item.codigo}</td>
                                <td>{item.nome}</td>
                                <td>{item.tipo}</td>
                                <td>{disponivelParaLiberar(item.lotes)}</td>
                                <td>
                                    <span className={`${styles.badge} ${sg === "vencido" ? styles.badgeVencido : sg === "vencendo" ? styles.badgeVencendo : styles.badgeBom}`}>
                                        {sg === "vencido" ? "Possui lote vencido" : sg === "vencendo" ? "Vencendo" : "Bom"}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
}
