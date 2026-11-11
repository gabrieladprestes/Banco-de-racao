// Rotas usadas pela área Admin do Projeto (Next.js).
// Registradas no index_Sql.js com: app.use('/admin', require('./rotas/admin.js'))
//
// As respostas usam os nomes do banco (ex.: Especie "Canino"/"Felino", CEP).
// A tradução para o formato das telas fica no front, em Projeto/services.

const express = require('express');
const { conectar } = require('../database.js');

const router = express.Router();

// O driver do SQL Server pode devolver números como texto (ex.: "7"),
// e nem sempre do mesmo jeito em consultas diferentes. Converte antes de comparar.
const numero = valor => (valor === null || valor === undefined ? null : Number(valor));

// Envia o erro com status 500, para o front saber que algo deu errado
function responderErro(resp, contexto, error) {
    console.error(`Erro em ${contexto}:`, error.message);
    resp.status(500).json({ erro: `Não foi possível carregar ${contexto}.`, detalhe: error.message });
}

// GET /admin/donatarios
// Donatário = pessoa física com CadÚnico preenchido. Vem com os animais (ligados pelo CPF).
router.get('/donatarios', async (req, resp) => {
    try {
        const cn = await conectar();

        const pessoas = await cn.request().query(`
            SELECT u.Id_usuario, u.Nome, u.Email, u.Telefone, u.CEP, f.CPF, f.Cad_unico
            FROM Usuario u
            INNER JOIN Fisico f ON f.Id_usuario = u.Id_usuario
            WHERE f.Cad_unico IS NOT NULL AND f.Cad_unico <> ''
            ORDER BY u.Nome
        `);

        const animais = await cn.request().query(`
            SELECT Id_animal, Nome, Especie, Porte, Idade, CPF
            FROM Animal
            ORDER BY Nome
        `);

        const donatarios = pessoas.recordset.map(p => ({
            Id_usuario: numero(p.Id_usuario),
            Nome: p.Nome,
            Email: p.Email,
            Telefone: p.Telefone,
            CEP: p.CEP,
            CPF: p.CPF,
            Cad_unico: p.Cad_unico,
            Animais: animais.recordset
                .filter(a => a.CPF === p.CPF)
                .map(a => ({ Id_animal: numero(a.Id_animal), Nome: a.Nome, Especie: a.Especie, Porte: a.Porte, Idade: a.Idade })),
        }));

        resp.json(donatarios);
    } catch (error) {
        responderErro(resp, "os donatários", error);
    }
});

// GET /admin/doadores
// Doador = toda pessoa jurídica + qualquer pessoa que já tenha agendamento de doação.
// Vem com o histórico de doações (itens das movimentações do tipo Doacao).
router.get('/doadores', async (req, resp) => {
    try {
        const cn = await conectar();

        const pessoas = await cn.request().query(`
            SELECT u.Id_usuario, u.Nome, u.Email, u.Telefone, u.CEP, f.CPF, j.CNPJ
            FROM Usuario u
            LEFT JOIN Fisico f ON f.Id_usuario = u.Id_usuario
            LEFT JOIN Juridico j ON j.Id_usuario = u.Id_usuario
            WHERE j.CNPJ IS NOT NULL
               OR u.Id_usuario IN (SELECT Id_usuario FROM Agendamento WHERE Tipo = 'Doacao')
            ORDER BY u.Nome
        `);

        const doacoes = await cn.request().query(`
            SELECT a.Id_usuario, a.Id_agendamento, a.Data_agendada,
                   p.Nome AS Produto, p.Peso, p.Categoria,
                   lp.Lote, lm.Id_lote_produto, lm.Quantidade
            FROM Agendamento a
            INNER JOIN Movimentacao m ON m.Id_agendamento = a.Id_agendamento AND m.Tipo = 'Doacao'
            INNER JOIN Lote_movimentacao lm ON lm.Id_movimentacao = m.Id_movimentacao
            INNER JOIN Lote_produto lp ON lp.Id_lote_produto = lm.Id_lote_produto
            INNER JOIN Produto p ON p.Id_produto = lp.Id_produto
            ORDER BY a.Data_agendada DESC
        `);

        const doadores = pessoas.recordset.map(p => ({
            Id_usuario: numero(p.Id_usuario),
            Nome: p.Nome,
            Email: p.Email,
            Telefone: p.Telefone,
            CEP: p.CEP,
            CPF: p.CPF,
            CNPJ: p.CNPJ,
            Doacoes: doacoes.recordset
                .filter(d => numero(d.Id_usuario) === numero(p.Id_usuario))
                .map(d => ({
                    Id_agendamento: numero(d.Id_agendamento),
                    Id_lote_produto: numero(d.Id_lote_produto),
                    Data_agendada: d.Data_agendada,
                    Produto: d.Produto,
                    Peso: d.Peso,
                    Categoria: d.Categoria,
                    Lote: d.Lote,
                    Quantidade: numero(d.Quantidade),
                })),
        }));

        resp.json(doadores);
    } catch (error) {
        responderErro(resp, "os doadores", error);
    }
});

module.exports = router;
