# Área Administrativa — Banco de Ração

Guia da parte Admin (`/Admin/...`): onde fica cada coisa, as regras do negócio e um roteiro para testar antes de apresentar.

> **Importante:** ainda não existe banco de dados nem API. Os dados vêm de **mocks** (dados fictícios em `services/mocks`).
> As alterações feitas nas telas valem enquanto você navega pelo menu e **voltam ao original com F5**.

---

## 1. Estrutura

```
app/(private)/Admin/
  layout.tsx                 sidebar, topo e rodapé de todas as telas Admin
  page.tsx                   /Admin → redireciona para o Dashboard
  <Tela>/page.tsx            cada página só renderiza o componente da tela

components/Admin<Tela>/      a tela de verdade (estado, formulários, modais) + CSS
components/AdminCampoBusca/  campo com lista e pesquisa (usado para escolher lotes)

services/
  *.service.ts               ÚNICO lugar de onde as telas leem e gravam dados
  mocks/*.mock.ts            dados fictícios (no lugar do banco)
  sessao.ts                  usuário fixo "Administrador" (até existir login)

interfaces/admin*.ts         tipos (formato dos dados)
utils/dateUtils.ts           datas (sempre texto "AAAA-MM-DD")
utils/estoqueUtils.ts        regras de estoque: validade, disponível, lotes
```

| Tela | Rota | Componente |
|---|---|---|
| Dashboard | `/Admin/DashboardAdmin` | `AdminDashboard` |
| Atendimento | `/Admin/Atendimento` | `AdminAtendimento` |
| Consulta de Estoque | `/Admin/ConsultaEstoque` | `AdminConsultaEstoque` |
| Recebimento de Doação | `/Admin/ReceberDoacao` | `AdminReceberDoacao` |
| Saída de Doação | `/Admin/RetiradaDoacao` | `AdminSaidaDoacao` |
| Cadastro de Produtos | `/Admin/CadastroProdutos` | `AdminCadastroProduto` |
| Consulta de Donatários | `/Admin/ConsultaDonatario` | `AdminConsultaDonatario` |
| Consulta de Doadores | `/Admin/ConsultaDoador` | `AdminConsultaDoador` |
| Calendário de Retiradas | `/Admin/AgendamentosRetirada` | `AdminAgendamentosRetirada` |
| Gerenciar Agendas | `/Admin/GerenciarAgendas` | `AdminGerenciarAgendas` |
| Histórico | `/Admin/HistoricoRetiradas` | `AdminHistoricoRetiradas` |

### Como os dados fluem

```
Tela (componente)  →  service (async)  →  mock (hoje)  /  API (depois)
```

As telas **nunca** importam mocks diretamente: sempre chamam uma função do service.
Assim, quando a API existir, só o corpo das funções do service muda:

```ts
// hoje (services/donatarios.service.ts)
export async function listarDonatarios() {
    return mockDonatarios;
}

// com a API
export async function listarDonatarios() {
    const resposta = await fetch("/api/donatarios");
    return resposta.json();
}
```

| Service | O que faz |
|---|---|
| `produtos.service` | lista de produtos cadastrados |
| `estoque.service` | estoque, entrada/baixa de lotes, reserva |
| `donatarios.service` / `doadores.service` | cadastros e buscas |
| `retiradas.service` | pedidos de retirada: aprovar, recusar, reabrir, entregar, cancelar; histórico |
| `doacoes.service` | doações: aprovar, recusar, reabrir, receber; histórico |
| `atendimento.service` | regra de cota (kg por mês por pet) |
| `dashboard.service` | números do Dashboard e a agenda |

---

## 2. Regras do negócio

### Datas
- Toda data trafega como texto `"AAAA-MM-DD"` e é exibida com `formatarData()` (`DD/MM/AAAA`).
- **Não use** `new Date("AAAA-MM-DD")`: o JavaScript lê como meia-noite UTC e, no horário de Brasília, a data volta um dia.

### Ciclo de vida
```
Retirada:  pendente → aprovado → entregue          Doação:  pendente → aprovado → recebido
              ↘ recusado     ↘ cancelado                       ↘ recusado
```
- **Pendente**: aparece no Gerenciar Agendas.
- **Aprovado**: aparece no Calendário, na Saída / no Receber e na Agenda do Dashboard.
- **Entregue / recebido**: vai para o Histórico.
- Aprovado ou recusado pode ser **reaberto** (volta a pendente).

### Lotes
- **Lote interno**: gerado pelo sistema — `L` Ração, `M` Medicamento, `P` Petisco, `O` Outros + número (`L007`).
- **Lote do fabricante**: o da embalagem, **opcional** (sem ele aparece "Não informado").
- No recebimento: mesmo lote do fabricante **e** mesma validade → soma no lote interno existente; caso contrário, gera um novo.
- A **validade** é obrigatória no recebimento.

### Disponível
- **Disponível = saldo dos lotes dentro da validade − reservado.** É o mesmo número em todas as telas.
- Lote vencido não conta e não pode sair.
- Na Saída de Doação aparece **"Pode sair"** = disponível + a reserva da própria retirada.

### Reserva
- **Aprovar** uma retirada reserva a quantidade no estoque.
- **Recusar, reabrir ou cancelar** a entrega devolve a reserva; **entregar** consome a reserva.
- A reserva é por produto e fica distribuída nos lotes que vencem primeiro.
- Não é possível aprovar acima do disponível (bloqueia).

### Saída de lotes
- O sistema sugere os lotes que **vencem primeiro**; o funcionário pode trocar ou dividir entre lotes.
- Não permite: mais que o solicitado, mais que o saldo do lote, lote vencido, mesmo lote duas vezes.

### Cota (provisória, em `atendimento.service.ts`)
| | Pequeno | Médio | Grande |
|---|---|---|---|
| Cachorro (Ração de Cachorro) | 3 kg | 6 kg | 10 kg |
| Gato (Ração de Gato) | 3 kg | 3 kg | 3 kg |

- Cota do mês = soma dos pets do donatário.
- **Saldo da cota = cota − entregue no mês − aprovado no mês.**
- O mês considerado é o da **data agendada** do pedido.
- Acima da cota **avisa, mas permite** aprovar (registre o motivo na observação).

### Motivos (auditoria)
- **Recusar** (pedido ou doação) e **cancelar entrega** exigem motivo; ele fica registrado e aparece no card.
- Responsável das operações: "Administrador" (`services/sessao.ts`) até existir login.

---

## 3. Roteiro de teste (≈ 10 min)

Rode `npm run dev` e abra `http://localhost:3000/Admin`. **Não aperte F5 no meio** (os dados voltam ao original).

**Navegação**
- [ ] `/Admin` abre o Dashboard; o link da página atual fica destacado na sidebar.
- [ ] Abrir uma tela de submenu e apertar F5: o grupo continua aberto.

**Dashboard**
- [ ] Cartões mostram estoque, validade, abaixo do mínimo (Antipulgas), pendentes e doações a receber.
- [ ] A Agenda mostra atrasados (vermelho) e próximos 7 dias; "Abrir" leva à tela certa.

**Retirada completa**
- [ ] Consulta de Estoque: anote o reservado e o disponível da Ração de Cachorro.
- [ ] Gerenciar Agendas → Vanessa Rocha → Aprovar. O reservado sobe 4 e o disponível cai 4.
- [ ] Calendário: Vanessa aparece no dia agendado (use as setas ‹ › se a data cair em outro mês).
- [ ] Saída de Doação → RET-2026-018: o lote sugerido é o que vence primeiro; o lote vencido não aparece na lista.
- [ ] Digitar uma quantidade maior que a solicitada → mensagem de erro.
- [ ] Confirmar Entrega → aparece no Histórico, com lote interno e do fabricante.
- [ ] Atendimento → Vanessa: a coluna "Retirado" mostra o que foi entregue.

**Doação completa**
- [ ] Gerenciar Agendas → Doações → AG-2026-012 → Confirmar Agendamento.
- [ ] Receber Doação → AG-2026-012 → no lote do fabricante digite `WH2410` e Enter: a validade é preenchida e aparece "Soma ao lote interno L004".
- [ ] + Adicionar produto → Petisco Cachorro, lote `SN-9001`, validade e quantidade → "Novo lote interno será gerado".
- [ ] Confirmar → a mensagem mostra `L004` e `P003 (novo)`; a Consulta de Estoque e a ficha do doador mostram a doação.

**Erros esperados**
- [ ] Gerenciar Agendas → Paulo Henrique: quantidade 999 → "Sem estoque" e Aprovar desabilitado.
- [ ] Quantidade 12 → "Acima da cota" com aviso amarelo (dá para aprovar).
- [ ] Data no passado → erro; Recusar sem motivo → erro.

**Celular** (DevTools → modo dispositivo, 390 px)
- [ ] Menu ☰ abre e fecha; tabelas rolam para o lado sem alargar a página; modais cabem na tela.

---

## 4. Rodando com o banco (SQL Server)

Algumas telas já buscam os dados no servidor (`Server`). As outras continuam nos mocks.

| Tela | Fonte dos dados |
|---|---|
| Consulta de Donatários | **banco** (`GET /admin/donatarios`) |
| Consulta de Doadores | **banco** (`GET /admin/doadores`) |
| Demais telas | mocks (`services/mocks`) |

**Passo a passo**
1. No SQL Server, crie o banco com `Server/estrutura_banco/Script_banco_racao.sql`.
2. Em `Server/database.js`, troque `server: 'NoteGab'` pelo nome do **seu** SQL Server.
3. Suba o servidor: na pasta `Server`, rode `npm install` (só na primeira vez) e depois `npm run dev`. Deve aparecer `Servidor http://localhost:3010`.
4. Na pasta `Projeto`, crie o arquivo **`.env.local`** com a linha:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3010
   ```
5. Rode o site (`npm run dev` na pasta `Projeto`). Se ele já estava rodando, pare e rode de novo: o `.env.local` só é lido ao iniciar.

**Sem o `.env.local`**, todas as telas usam os mocks (útil para apresentar sem o banco).
O `.env.local` não vai para o Git (está no `.gitignore`): cada pessoa cria o seu.

**Como os dados do banco aparecem nas telas**
- **Donatário** = pessoa física (`Fisico`) com CadÚnico preenchido; os pets vêm de `Animal`, ligados pelo CPF.
- **Doador** = toda pessoa jurídica (`Juridico`) + quem já tem agendamento do tipo `Doacao`.
- Espécie: `Canino` → Cachorro, `Felino` → Gato. Endereço: o banco só tem CEP.
- No histórico do doador, "Qtd" é o número de **unidades/sacos** do produto (como o banco guarda), não kg.

**Se der erro**, a tela mostra a mensagem no lugar da lista:
- "Não foi possível conectar ao servidor": o servidor da pasta `Server` não está rodando ou o endereço do `.env.local` está errado.
- "Não foi possível carregar os donatários/doadores": o servidor está rodando, mas não conseguiu falar com o banco (veja o terminal do servidor: nome do SQL Server, banco criado, driver ODBC 17).

---

## 5. Pendências

**Fora do Admin**
- A rota `/` está duplicada: `app/page.tsx` e `app/(public)/page.tsx`. O `next build` falha por isso — decidir com o grupo qual fica.
- TypeScript, ESLint e `next build` do projeto inteiro: ainda não conferidos (a decidir com o grupo).

**Integração com o banco**
- Ainda nos mocks: Atendimento, Estoque, Receber/Saída, Gerenciar Agendas, Calendário, Histórico e Dashboard. Dependem de status, itens e motivo nos agendamentos, que o banco ainda não tem.
- O Atendimento ainda busca donatários nos mocks: com o banco ligado, os nomes podem ser diferentes dos da Consulta de Donatários.

**No Admin (ainda não existe)**
- Relatórios de Estoque, Cadastro de Donatário e Cadastro de Doador (aparecem desabilitados no menu).
- Login (o "Sair" volta para a Home).
- Cadastro de Produtos: o produto novo aparece na lista, mas ainda não é gravado no service (some ao trocar de tela).
- Cota de medicamentos e petiscos (hoje só ração tem cota).
