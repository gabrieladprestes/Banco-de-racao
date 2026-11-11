// Ligação com o servidor (pasta Server). O endereço vem do arquivo .env.local:
//
//     NEXT_PUBLIC_API_URL=http://localhost:3010
//
// Sem esse arquivo, as telas continuam usando os mocks (services/mocks),
// então o Admin funciona mesmo sem o SQL Server rodando.

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

// true quando há servidor configurado
export const usarServidor = API_URL !== "";

// GET no servidor. Se der erro (servidor fora do ar ou erro no banco), lança uma mensagem clara.
export async function apiGet<T>(caminho: string): Promise<T> {
    let resposta: Response;
    try {
        resposta = await fetch(`${API_URL}${caminho}`, { cache: "no-store" });
    } catch {
        throw new Error(`Não foi possível conectar ao servidor (${API_URL}). Ele está rodando?`);
    }
    if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        throw new Error(corpo?.erro ?? `O servidor respondeu com erro ${resposta.status}.`);
    }
    return resposta.json() as Promise<T>;
}

// Datas do SQL Server chegam como "2026-03-15T00:00:00.000Z": fica só "AAAA-MM-DD"
export const dataDoBanco = (data: string | null) => (data ?? "").slice(0, 10);
