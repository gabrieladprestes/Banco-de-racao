import Recibo from "@/components/CustomRecibo/Recibo";

export default function Doacao() {
  return (
    <main>
    <Recibo
        tipodoacao="Produto Retirado"
      numero="009"
      nome="João Silva"
      documento="123.456.789-00"
      orgao="SSP"
      rua="Rua das Flores"
      cidade="Votorantim"
      numeroEndereco="123"
      cnpj="00.000.000/0001-00"
      codigoItem="096967"
      quantidade="1KG"
      descricao="Ração Seca"
      lote="07486"
      data="02/05/2025"
      hora="10:20"
    />
    </main>
  );
}