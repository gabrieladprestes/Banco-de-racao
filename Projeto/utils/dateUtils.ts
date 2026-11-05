// Todas as datas do sistema trafegam como texto "AAAA-MM-DD".
// Nunca use new Date("AAAA-MM-DD"): o JavaScript lê como meia-noite UTC
// e, no horário de Brasília, a data volta um dia.

// Date -> "AAAA-MM-DD" usando o horário local
export const paraISO = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

// "AAAA-MM-DD" -> Date à meia-noite no horário local
export const parseDataLocal = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
};

export const getTodayDate = () => paraISO(new Date());

// "AAAA-MM-DD" -> "DD/MM/AAAA" sem passar por Date (evita voltar um dia por causa do fuso)
export const formatarData = (data: string) => data.split("-").reverse().join("/");

export const ehMesAtual = (data: string) => data.slice(0, 7) === getTodayDate().slice(0, 7);

// Dias inteiros entre hoje e a data (negativo = já passou)
export const diasAte = (data: string) => {
    const hoje = parseDataLocal(getTodayDate());
    return Math.round((parseDataLocal(data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
};

// ---- Usadas pelos mocks, para os dados sempre parecerem atuais ----

// Hoje + N dias (N negativo = passado)
export const dataRelativa = (dias: number) => {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return paraISO(data);
};

// Dia fixo do mês atual (limitado ao último dia do mês)
export const diaDoMesAtual = (dia: number) => {
    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    return paraISO(new Date(hoje.getFullYear(), hoje.getMonth(), Math.min(dia, ultimoDia)));
};

// Data no mês atual, sem passar de hoje
export const dataNoMesAtual = (dia: number) => {
    const hoje = getTodayDate();
    const diaValido = Math.min(dia, Number(hoje.slice(8)));
    return `${hoje.slice(0, 8)}${String(diaValido).padStart(2, '0')}`;
};
