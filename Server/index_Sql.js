const express = require('express');
const cors = require('cors');
let app = express();
app.use(express.json());
let port = 3010

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { sql, conectar } = require('./database.js');

app.use(cors());

const pastaUploads = path.join(__dirname, "./img");

app.use("/img", express.static(pastaUploads));

if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, pastaUploads);
    },

    filename: function (req, file, cb) {
        const extensao = path.extname(file.originalname);

        const nomeArquivo =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}${extensao}`;
        cb(null, nomeArquivo);
    }
});

const upload = multer({
    storage: storage
})

app.use("/img", express.static(pastaUploads));

app.get('/qtd', async (req, resp) => {
    try {
        const cn = await conectar();
        const qtd = await cn.request().query("SELECT COUNT(*) as total FROM Animal");
        resp.json({ "qtd": qtd.recordset[0].total });
    } catch (error) {
        resp.json({ "tipo de erro ": error })
    }
})

app.get('/retirada', async (req, resp) => {
    try {
        const cn = await conectar();
        const resultado = await cn.request().query(`
            SELECT a.Id_agendamento, p.Categoria, a.Data_agendada, lp.Validade, lp.Lote, lm.Quantidade FROM Agendamento a
            INNER JOIN Movimentacao m ON a.Id_agendamento = m.Id_agendamento AND m.Tipo = 'Retirada'
            INNER JOIN Lote_movimentacao lm ON m.Id_movimentacao = lm.Id_movimentacao
            INNER JOIN Lote_produto lp ON lm.Id_lote_produto = lp.Id_lote_produto
            INNER JOIN Produto p ON p.Id_produto = lp.Id_produto;
        `)
        resp.json(resultado.recordset)
    } catch (error) {
        resp.json({ "erro: ": error })
    }
})

app.get('/doacao', async (req, resp) => {
    try {
        const cn = await conectar();
        const resultado = await cn.request().query(`
            SELECT a.Id_agendamento, p.Categoria, a.Data_agendada, lp.Validade, lp.Lote, lm.Quantidade FROM Agendamento a
            INNER JOIN Movimentacao m ON a.Id_agendamento = m.Id_agendamento AND m.Tipo = 'Doacao'
            INNER JOIN Lote_movimentacao lm ON m.Id_movimentacao = lm.Id_movimentacao
            INNER JOIN Lote_produto lp ON lm.Id_lote_produto = lp.Id_lote_produto
            INNER JOIN Produto p ON p.Id_produto = lp.Id_produto;
        `)
        resp.json(resultado.recordset)
    } catch (error) {
        resp.json({ "erro: ": error })
    }
})

app.post('/agendarDoacao', async (req, resp) => {
    try {
        const {
            dataAgendada,
        } = req.body

        const cn = await conectar();

        await cn.request()
            .input('dataAgendada', sql.Date, dataAgendada)
            .query(`
                INSERT INTO Agendamento (
                    Data_agendada,
                    Tipo,
                    Id_usuario
                ) VALUES (
                    @dataAgendada,
                    'Doacao',
                    1
                )
            `)
        
        resp.status(201).json({
            "MS": "OK"
        })
    } catch (e) {
        console.error("Erro ao realizar agendamento: ", e.message);
        resp.status(500).json({ error: e.message });
    }
})

app.post('/agendarRetirada', async (req, resp) => {
    try {
        const {
            dataAgendada
        } = req.body

        const cn = await conectar();

        await cn.request()
            .input('dataAgendada', sql.Date, dataAgendada)
            .query(`
                INSERT INTO Agendamento (
                    Data_agendada,
                    Tipo,
                    Id_usuario
                ) VALUES (
                    @dataAgendada,
                    'Retirar',
                    1
                )
            `)
        
        resp.status(201).json({
            "MS": "OK"
        })
    } catch (e) {
        console.error("Erro ao realizar agendamento: ", e.message)
        resp.status(500).json({ error: e.message })
    }
})

app.listen(port, () => {
    console.log(`Servidor http://localhost:${port}`);
}); 