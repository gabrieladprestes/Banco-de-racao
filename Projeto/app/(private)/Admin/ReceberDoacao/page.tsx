import { redirect } from "next/navigation";

// O recebimento de doações agora fica no Atendimento (aba Doação).
// O endereço antigo continua funcionando para links salvos.
export default function ReceberDoacao() {
    redirect("/Admin/Atendimento?aba=doacao");
}
