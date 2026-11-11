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

app.post('/cadastrarPet', upload.single("foto"), async (req, res) => {
    try {
        const {
            nome,
            idade,
            porte,
            especie,
            sexo,
            castrado,
            microchipado
        } = req.body;

        const cn = await conectar();

        const result = await cn
        .request()
        .input('nome', sql.VarChar(50), nome)
        .input('idade', sql.VarChar(7), idade)
        .input('porte', sql.VarChar(10), porte)
        .input('especie', sql.VarChar(10), especie)
        .input('sexo', sql.Char(1), sexo)
        .input('castrado', sql.Bit, castrado)
        .input('microchip', sql.VarChar(19), microchipado)
        .query(`
            INSERT INTO Animal
            (
                Nome,
                Idade,
                Porte,
                Especie,
                Sexo,
                Castrado,
                Microchip,
                CPF
            )
            OUTPUT INSERTED.*
            VALUES
            (
                @nome,
                @idade,
                @porte,
                @especie,
                @sexo,
                @castrado,
                @microchip,
                '617.517.719-38'
            )
        `)
        
        const idAnimal = result.recordset[0].Id_animal

        if (req.file) {
            const caminhoFoto = `/img/${req.file.filename}`

            await cn
            .request()
            .input("id_animal", sql.Int, idAnimal)
            .input("url_foto", sql.VarChar(255), caminhoFoto)
            .query(`
                INSERT INTO Foto
                (
                    Id_animal,
                    Url_foto,
                    Principal,
                    Data_cadastro
                )
                VALUES
                (
                    @id_animal,
                    @url_foto,
                    1,
                    GETDATE()
                )
            `)
        }

        res.status(201).json({
            mensagem: 'Animal cadastrado com sucesso!',
        })
    } catch (error) {
        console.error("Erro ao cadastrar pet: ", error);
        res.status(500).json({ erro: error.message })
    }
})

// Rotas da área Admin (Projeto/app/(private)/Admin): ver Server/rotas/admin.js
app.use('/admin', require('./rotas/admin.js'));

app.listen(port, () => {
    console.log(`Servidor http://localhost:${port}`);
}); 