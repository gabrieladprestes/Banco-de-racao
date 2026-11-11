import { Suspense } from "react";
import { AdminAtendimento } from "@/components/AdminAtendimento/AdminAtendimento";

// Suspense: o Atendimento lê a aba do endereço (?aba=doacao)
export default function Atendimento() {
    return (
        <Suspense>
            <AdminAtendimento />
        </Suspense>
    );
}
