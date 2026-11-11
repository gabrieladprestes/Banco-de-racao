"use client";
import { useEffect, useState } from "react";
import styles from "./AdminReceberDoacao.module.css";
import { IAdminDoacaoAgendada } from "../../interfaces/adminDoacaoAgendada.interface";
import { buscarDoacoesAgendadas } from "../../services/doacoes.service";
import { formatarData } from "../../utils/dateUtils";
import { AdminModalRecebimento } from "../AdminModalRecebimento/AdminModalRecebimento";

// Lista das doações aprovadas aguardando o recebimento. Clicar abre o modal de recebimento.
export function AdminReceberDoacao() {
    const [doacoesPendentes, setDoacoesPendentes] = useState<IAdminDoacaoAgendada[]>([]);
    const [resultado, setResultado] = useState<IAdminDoacaoAgendada[]>([]);
    const [filtroData, setFiltroData] = useState("");
    const [filtroDoador, setFiltroDoador] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [selecionada, setSelecionada] = useState<IAdminDoacaoAgendada | null>(null);

    useEffect(() => {
        buscarDoacoesAgendadas().then(dados => {
            setDoacoesPendentes(dados);
            setResultado(dados);
        });
    }, []);

    function filtrar() {
        setResultado(doacoesPendentes.filter(d =>
            (!filtroData || d.dataAgendada === filtroData) &&
            (!filtroDoador || d.nomeDoador.toLowerCase().includes(filtroDoador.toLowerCase()))
        ));
    }

    function abrirModal(doacao: IAdminDoacaoAgendada) {
        setSelecionada(doacao);
    }

    // Tira a doação concluída das listas e mostra o aviso
    function concluir(texto: string) {
        if (!selecionada) return;
        const id = selecionada.id;
        setDoacoesPendentes(lista => lista.filter(d => d.id !== id));
        setResultado(lista => lista.filter(d => d.id !== id));
        setSelecionada(null);
        setMensagem(texto);
        setTimeout(() => setMensagem(""), 6000);
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
                <AdminModalRecebimento
                    key={selecionada.id}
                    doacao={selecionada}
                    onFechar={() => setSelecionada(null)}
                    onConcluido={concluir}
                />
            )}
        </>
    );
}
