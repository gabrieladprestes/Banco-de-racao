"use client";
import { useEffect, useState } from "react";
import styles from "./AdminSaidaDoacao.module.css";
import { IAdminSaidaDoacao } from "../../interfaces/adminSaidaDoacao.interface";
import { buscarSaidasPendentes } from "../../services/retiradas.service";
import { formatarData } from "../../utils/dateUtils";
import { AdminModalEntrega } from "../AdminModalEntrega/AdminModalEntrega";

// Lista das retiradas aprovadas aguardando a entrega. Clicar abre o modal de entrega.
export function AdminSaidaDoacao() {
    const [saidasPendentes, setSaidasPendentes] = useState<IAdminSaidaDoacao[]>([]);
    const [resultado, setResultado] = useState<IAdminSaidaDoacao[]>([]);
    const [filtroData, setFiltroData] = useState("");
    const [filtroDonatario, setFiltroDonatario] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [selecionada, setSelecionada] = useState<IAdminSaidaDoacao | null>(null);

    useEffect(() => {
        buscarSaidasPendentes().then(dados => {
            setSaidasPendentes(dados);
            setResultado(dados);
        });
    }, []);

    function filtrar() {
        setResultado(saidasPendentes.filter(s =>
            (!filtroData || s.dataAgendada === filtroData) &&
            (!filtroDonatario || s.nomeDonatario.toLowerCase().includes(filtroDonatario.toLowerCase()))
        ));
    }

    function abrirModal(saida: IAdminSaidaDoacao) {
        setSelecionada(saida);
    }

    function resumoItens(saida: IAdminSaidaDoacao) {
        return saida.itens.map(i => `${i.item} (${i.quantidadeSolicitada} kg)`).join(", ");
    }

    // Tira a retirada concluída das listas e mostra o aviso
    function concluir(texto: string) {
        if (!selecionada) return;
        const id = selecionada.id;
        setSaidasPendentes(lista => lista.filter(s => s.id !== id));
        setResultado(lista => lista.filter(s => s.id !== id));
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
                <AdminModalEntrega
                    key={selecionada.id}
                    saida={selecionada}
                    onFechar={() => setSelecionada(null)}
                    onConcluido={concluir}
                />
            )}
        </>
    );
}
