import { redirect } from "next/navigation";

// A entrega de retiradas agora fica no Atendimento (aba Retirada).
// O endereço antigo continua funcionando para links salvos.
export default function RetiradaDoacao() {
    redirect("/Admin/Atendimento?aba=retirada");
}
