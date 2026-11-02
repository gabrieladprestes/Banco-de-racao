"use client";
import { CSSProperties, useEffect, useId, useRef, useState } from "react";
import styles from "./AdminCampoBusca.module.css";

export interface IOpcaoBusca {
    valor: string;      // o que é gravado (ex.: "L001")
    rotulo: string;     // texto principal da opção
    detalhe?: string;   // texto menor ao lado (ex.: validade e saldo)
}

interface Props {
    value: string;
    opcoes: IOpcaoBusca[];
    onChange: (valor: string) => void;
    // Chamado quando o usuário escolhe uma opção da lista
    onSelecionar?: (opcao: IOpcaoBusca) => void;
    // true: aceita qualquer texto digitado (a lista é só sugestão)
    // false: o valor precisa ser uma das opções
    textoLivre?: boolean;
    placeholder?: string;
    ariaLabel: string;
    vazio?: string;
}

// Campo com lista e pesquisa. A lista usa posição fixa para não ser cortada
// por modais com rolagem, e fecha ao rolar a página ou clicar fora.
export function AdminCampoBusca({
    value, opcoes, onChange, onSelecionar, textoLivre = false, placeholder, ariaLabel, vazio = "Nenhuma opção encontrada",
}: Props) {
    const [aberto, setAberto] = useState(false);
    const [focado, setFocado] = useState(false);
    const [busca, setBusca] = useState("");
    const [destaque, setDestaque] = useState(0);
    const [posicao, setPosicao] = useState<CSSProperties>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const listaId = useId();

    const rotuloAtual = opcoes.find(o => o.valor === value)?.rotulo ?? value;
    // No modo texto livre o campo mostra o valor; no modo lista, o que está sendo digitado
    const exibido = textoLivre ? value : (focado ? busca : rotuloAtual);
    const termo = (textoLivre ? value : busca).trim().toLowerCase();
    const filtradas = opcoes.filter(o =>
        !termo || o.rotulo.toLowerCase().includes(termo) || (o.detalhe ?? "").toLowerCase().includes(termo)
    );

    // Fecha a lista se a página (ou o modal) rolar
    useEffect(() => {
        if (!aberto) return;
        const fechar = () => setAberto(false);
        window.addEventListener("scroll", fechar, true);
        window.addEventListener("resize", fechar);
        return () => {
            window.removeEventListener("scroll", fechar, true);
            window.removeEventListener("resize", fechar);
        };
    }, [aberto]);

    function abrir() {
        const r = inputRef.current?.getBoundingClientRect();
        if (r) setPosicao({ top: r.bottom + 2, left: r.left, minWidth: r.width });
        setDestaque(0);
        setAberto(true);
    }

    function escolher(opcao: IOpcaoBusca) {
        onChange(opcao.valor);
        onSelecionar?.(opcao);
        setBusca("");
        setAberto(false);
        inputRef.current?.blur();
    }

    function teclado(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!aberto) abrir();
            else setDestaque(d => Math.min(d + 1, filtradas.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setDestaque(d => Math.max(d - 1, 0));
        } else if (e.key === "Enter" && aberto && filtradas[destaque]) {
            e.preventDefault();
            escolher(filtradas[destaque]);
        } else if (e.key === "Escape") {
            setAberto(false);
        }
    }

    return (
        <div className={styles.campo}>
            <input
                ref={inputRef}
                role="combobox"
                aria-label={ariaLabel}
                aria-expanded={aberto}
                aria-controls={listaId}
                aria-autocomplete="list"
                className={styles.input}
                placeholder={textoLivre ? placeholder : (rotuloAtual || placeholder)}
                value={exibido}
                onFocus={() => { setFocado(true); setBusca(""); abrir(); }}
                onBlur={() => { setFocado(false); setAberto(false); }}
                onChange={e => {
                    if (textoLivre) onChange(e.target.value.toUpperCase());
                    else setBusca(e.target.value);
                    if (!aberto) abrir();
                    setDestaque(0);
                }}
                onKeyDown={teclado}
            />
            {!textoLivre && <span className={styles.seta} aria-hidden>▾</span>}

            {aberto && (filtradas.length > 0 || !textoLivre) && (
                <ul id={listaId} role="listbox" className={styles.lista} style={posicao}>
                    {filtradas.map((o, i) => (
                        <li
                            key={o.valor}
                            role="option"
                            aria-selected={o.valor === value}
                            className={`${styles.opcao} ${i === destaque ? styles.opcaoDestaque : ""}`}
                            // mousedown em vez de click: acontece antes do blur do input
                            onMouseDown={e => { e.preventDefault(); escolher(o); }}
                            onMouseEnter={() => setDestaque(i)}
                        >
                            <span className={styles.rotulo}>{o.rotulo}</span>
                            {o.detalhe && <span className={styles.detalhe}>{o.detalhe}</span>}
                        </li>
                    ))}
                    {filtradas.length === 0 && <li className={styles.vazio}>{vazio}</li>}
                </ul>
            )}
        </div>
    );
}
