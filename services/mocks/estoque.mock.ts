import { IAdminEstoque, IAdminEstoqueLote } from "../../interfaces/adminEstoque.interface";
import { dataRelativa } from "../../utils/dateUtils";
import { mockProdutos } from "./produtos.mock";

// lote = interno (gerado pelo sistema) · loteFabricante = o da embalagem (opcional)
// saldoReservado começa em 0: estoque.service calcula a reserva a partir das retiradas aprovadas
// Validades relativas a hoje, para sempre existir lote bom, vencendo (até 30 dias) e vencido
const lotesPorProduto: Record<string, IAdminEstoqueLote[]> = {
    RC001: [
        { lote: "L001", loteFabricante: "PD2409A",  saldoEstoque: 45, saldoReservado: 0, validade: dataRelativa(120) },
        { lote: "L002", loteFabricante: "PD2501C",  saldoEstoque: 30, saldoReservado: 0,  validade: dataRelativa(20)  },
        { lote: "L003", loteFabricante: "GN2312",   saldoEstoque: 10, saldoReservado: 0, validade: dataRelativa(-10) },
    ],
    RG001: [
        { lote: "L004", loteFabricante: "WH2410B",  saldoEstoque: 20, saldoReservado: 0,  validade: dataRelativa(60)  },
        { lote: "L005", loteFabricante: "WH2502",   saldoEstoque: 8,  saldoReservado: 0,  validade: dataRelativa(15)  },
        { lote: "L006",                             saldoEstoque: 5,  saldoReservado: 0,  validade: dataRelativa(-30) },
    ],
    VC001: [{ lote: "M001", loteFabricante: "VRM-8812", saldoEstoque: 60, saldoReservado: 0, validade: dataRelativa(150) }],
    VG001: [{ lote: "M002", loteFabricante: "VRM-9034", saldoEstoque: 40, saldoReservado: 0, validade: dataRelativa(25)  }],
    // Antipulgas abaixo do estoque mínimo (8), para o alerta do Dashboard
    AP001: [{ lote: "M003", loteFabricante: "AP-55102", saldoEstoque: 6, saldoReservado: 0, validade: dataRelativa(10)  }],
    PC001: [{ lote: "P001", loteFabricante: "SN-2207",  saldoEstoque: 15, saldoReservado: 0,  validade: dataRelativa(90)  }],
    PG001: [{ lote: "P002",                             saldoEstoque: 12, saldoReservado: 0,  validade: dataRelativa(5)   }],
};

// Nome e tipo vêm do cadastro de produtos, para não divergirem
export const mockEstoque: IAdminEstoque[] = mockProdutos.map(p => ({
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    tipo: p.tipo,
    lotes: lotesPorProduto[p.codigo] ?? [],
}));

// Lote do fabricante de um lote interno (usado para montar o histórico dos mocks)
export function loteFabricanteDe(loteInterno: string) {
    return mockEstoque.flatMap(e => e.lotes).find(l => l.lote === loteInterno)?.loteFabricante;
}
