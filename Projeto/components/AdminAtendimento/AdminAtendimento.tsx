"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./AdminAtendimento.module.css";
import { PackageMinus, PackagePlus } from "lucide-react";
import { AbaRetirada } from "./AbaRetirada";
import { AbaDoacao } from "./AbaDoacao";

// Atendimento no balcão: uma tela para quem chega retirar (donatário) ou doar (doador).
// A aba pode vir no endereço: /Admin/Atendimento?aba=doacao

type Aba = "retirada" | "doacao";

export function AdminAtendimento() {
    const router = useRouter();
    const pathname = usePathname();
    // A aba fica no endereço: o F5 e os links (Dashboard) abrem na aba certa
    const aba: Aba = useSearchParams().get("aba") === "doacao" ? "doacao" : "retirada";

    function trocarAba(nova: Aba) {
        router.replace(`${pathname}?aba=${nova}`, { scroll: false });
    }

    return (
        <>
            <div className={styles.abas} role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={aba === "retirada"}
                    className={`${styles.aba} ${aba === "retirada" ? styles.abaAtiva : ""}`}
                    onClick={() => trocarAba("retirada")}
                >
                    <PackageMinus size={18} aria-hidden /> Retirada <span className={styles.abaSub}>donatário</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={aba === "doacao"}
                    className={`${styles.aba} ${aba === "doacao" ? styles.abaAtiva : ""}`}
                    onClick={() => trocarAba("doacao")}
                >
                    <PackagePlus size={18} aria-hidden /> Doação <span className={styles.abaSub}>doador</span>
                </button>
            </div>

            {aba === "retirada" ? <AbaRetirada /> : <AbaDoacao />}
        </>
    );
}
