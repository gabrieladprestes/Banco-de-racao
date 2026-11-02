import { EspeciePet, IAdminPet, PortePet } from "../interfaces/adminDonatario.interface";
import { IAdminEstoque } from "../interfaces/adminEstoque.interface";
import { IAdminHistoricoRetirada } from "../interfaces/adminHistoricoRetirada.interface";
import { IAdminCotaProduto } from "../interfaces/adminAtendimento.interface";
import { IAdminSolicitacaoItem } from "../interfaces/adminSolicitacao.interface";
import { disponivelParaLiberar } from "../utils/estoqueUtils";

// As buscas usadas pelo Atendimento ficam nos services de cada assunto:
// donatarios.service.ts, estoque.service.ts e retiradas.service.ts

// Regra provisória de cota (kg por mês) até a regra oficial ser definida
export const COTA_MENSAL_KG: Record<EspeciePet, Record<PortePet, number>> = {
    Cachorro: { Pequeno: 3, Médio: 6, Grande: 10 },
    Gato:     { Pequeno: 3, Médio: 3, Grande: 3 },
};

// Produto do estoque que cada espécie recebe
export const PRODUTO_POR_ESPECIE: Record<EspeciePet, string> = {
    Cachorro: "RC001",
    Gato: "RG001",
};

// Cota do mês por produto. Conta o que já foi entregue e o que já está aprovado
// (ainda não entregue) no mesmo mês, para o donatário não passar da cota com vários pedidos.
export function calcularCotas(
    pets: IAdminPet[],
    retiradasDoMes: IAdminHistoricoRetirada[],
    aprovadosDoMes: IAdminSolicitacaoItem[],
    estoque: IAdminEstoque[],
): IAdminCotaProduto[] {
    const cotaPorProduto = new Map<string, number>();
    pets.forEach(pet => {
        const codigo = PRODUTO_POR_ESPECIE[pet.especie];
        cotaPorProduto.set(codigo, (cotaPorProduto.get(codigo) ?? 0) + COTA_MENSAL_KG[pet.especie][pet.porte]);
    });

    return [...cotaPorProduto].map(([codigo, cotaMensal]) => {
        const produto = estoque.find(p => p.codigo === codigo);
        const retiradoMes = retiradasDoMes
            .flatMap(r => r.itens)
            .filter(i => i.codigo === codigo)
            .reduce((acc, i) => acc + i.quantidade, 0);
        const aprovadoMes = aprovadosDoMes
            .filter(i => i.codigoProduto === codigo)
            .reduce((acc, i) => acc + i.quantidade, 0);
        const saldoCota = Math.max(cotaMensal - retiradoMes - aprovadoMes, 0);
        const disponivelEstoque = produto ? disponivelParaLiberar(produto.lotes) : 0;

        return {
            codigo,
            nome: produto?.nome ?? codigo,
            cotaMensal,
            retiradoMes,
            aprovadoMes,
            saldoCota,
            disponivelEstoque,
            liberado: Math.min(saldoCota, disponivelEstoque),
        };
    });
}
