CREATE DATABASE Banco_Racao;

USE Banco_Racao;

CREATE TABLE Usuario(
	Id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(50) NOT NULL,
    Telefone VARCHAR(15) NOT NULL,
    CEP VARCHAR(9) NOT NULL
);

INSERT INTO Usuario (Nome, Email, Telefone, CEP) 
VALUES 
("Kauê Elias Farias", "kaue_elias_farias@avantii.com.br", "(95) 99864-7035", "69314-032"),
("Sophia Lara Amanda Figueiredo", "sophia-figueiredo91@jpmanager.com.br", "(61) 99294-4723", "72260-749"),
("Emily Clara dos Santos", "emilyclaradossantos@aclnet.com.br", "(24) 98378-5277", "27537-240"),
("Beatriz Manuela Caldeira", "beatrizmanuelacaldeira@renoveseuseguro.com", "(63) 99279-6186", "77824-685"),
("Isis Esther Tatiane Gonçalves", "isis.esther.goncalves@vipsaude.com.br", "(63) 98827-6206", "77006-772"),
("Alexandre Osvaldo Fernandes", "alexandre-fernandes83@chiba.net.br", "(61) 98881-4185", "70655-053"),
("Mariane Gabriela Sophia Mendes", "mariane-mendes77@jci.com", "(21) 99966-6029", "26323-380"),
("Benedita Aurora Sebastiana Moraes", "benedita.aurora.moraes@sodexo.com", "(81) 98952-7565", "50110-385"),
("Kauê João Pinto", "kauejoaopinto@unianhanguera.edu.br", "(82) 99363-4681", "57018-560"),
("Paulo Geraldo da Rocha", "paulo.geraldo.darocha@randstad.com.br", "(95) 99790-4526", "69307-500");

CREATE TABLE Fisico(
	CPF VARCHAR(14) PRIMARY KEY,
    Data_nasc DATE NOT NULL,
    Cad_unico VARCHAR(20) NOT NULL,
    Id_usuario INT NOT NULL,
    
    CONSTRAINT FK_IdUsuario_Fisico FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario)
);

INSERT INTO Fisico (CPF, Data_Nasc, Cad_unico, Id_usuario)
VALUES
("617.517.719-38", "2008-05-09", "425.84295.12-4", 1),
("373.374.565-57", "1980-01-24", "842.32819.33-2", 2),
("944.019.394-84", "1978-02-11", "942.18324.92-1", 3),
("845.368.016-77", "1988-04-24", "132.42372.28-8", 4),
("179.386.550-74", "1966-05-11", "732.28323.92-3", 5);

CREATE TABLE Juridico(
	CNPJ VARCHAR(18) PRIMARY KEY,
    Id_usuario INT NOT NULL,
    
    CONSTRAINT FK_IdUsuario_Juridico FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario)
);

INSERT INTO Juridico (CNPJ, Id_usuario)
VALUES
("37.977.809/0001-88", 6),
("84.037.887/0001-82", 7),
("73.663.803/0001-08", 8),
("51.783.701/0001-85", 9),
("98.041.462/0001-51", 10);

CREATE TABLE Animal(
	Id_animal INT IDENTITY(1,1) PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Idade VARCHAR(7) NOT NULL,
    Porte VARCHAR(10),
    Especie VARCHAR(10) NOT NULL,
    Sexo CHAR(1) NOT NULL,
    Castrado BOOLEAN NOT NULL,
    Vacinado BOOLEAN NOT NULL,
    Microchip VARCHAR(19),
    SinPatinhas VARCHAR(15),
    CPF VARCHAR(14) NOT NULL,
    
    CONSTRAINT FK_CPF_Animal FOREIGN KEY (CPF) REFERENCES Fisico(CPF)
);

INSERT INTO Animal (Nome, Idade, Porte, Especie, Sexo, Castrado, Vacinado, Microchip, SinPatinhas, CPF)
VALUES
("Nina", "Filhote", "Pequeno", "Canino", "F", 0, 1, "", "", "617.517.719-38"),
("Felix", "Adulto", "", "Felino", "M", 1, 1, "900 832 482 271 138", "847264927-1", "373.374.565-57"),
("Nico", "Sênior", "", "Felino", "M", 1, 0, "", "489274017-5", "944.019.394-84"),
("Maju", "Adulto", "Grande", "Canino", "F", 1, 0, "", "947291724-7", "944.019.394-84"),
("Snoopy", "Sênior", "Médio", "Canino", "M", 0, 0, "", "", "179.386.550-74");

CREATE TABLE Agendamento(
	Id_agendamento INT IDENTITY(1,1) PRIMARY KEY,
    Data_agendada DATE NOT NULL,
    Tipo VARCHAR(10) NOT NULL,
    Id_usuario INT NOT NULL,
    
    CONSTRAINT FK_IdUsuario_Agendamento FOREIGN KEY (Id_usuario) REFERENCES Usuario(Id_usuario)
);

INSERT INTO Agendamento (Data_agendada, Tipo, Id_usuario)
VALUES
("2026-01-28", "Retirada", 2),
("2026-03-15", "Doacao", 7),
("2026-03-18", "Retirada", 1),
("2026-04-02", "Retirada", 1),
("2026-04-23", "Doacao", 7);

CREATE TABLE Movimentacao(
	Id_movimentacao INT IDENTITY(1,1) PRIMARY KEY,
    Tipo VARCHAR(10) NOT NULL,
    Id_agendamento INT NOT NULL,
    
    CONSTRAINT FK_IdAgendamento FOREIGN KEY (Id_agendamento) REFERENCES Agendamento(Id_agendamento)
);

INSERT INTO Movimentacao (Tipo, Id_agendamento)
VALUES
("Retirada", 1),
("Doacao", 2),
("Retirada", 3),
("Retirada", 4),
("Doacao", 5);

CREATE TABLE Produto(
	Id_produto INT IDENTITY(1,1) PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Peso VARCHAR(6) NOT NULL,
    Categoria VARCHAR(25) NOT NULL
);

INSERT INTO Produto (Nome, Peso, Categoria)
VALUES
("Ração Pequena", "1kg", "Ração seca"),
("Ração Média", "5kg", "Ração seca"),
("Ração Grande", "10kg", "Ração seca"),
("Ração Pequena", "100g", "Ração úmida"),
("Ração Média", "280g", "Ração úmida");

CREATE TABLE Lote_produto(
	Id_lote_produto INT IDENTITY(1,1) PRIMARY KEY,
    Lote VARCHAR(20) NOT NULL,
    Quantidade INT NOT NULL,
    Validade DATE NOT NULL,
    Id_produto INT NOT NULL,
    
    CONSTRAINT FK_IdProduto FOREIGN KEY (Id_produto) REFERENCES Produto(Id_produto)
);

INSERT INTO Lote_produto (Lote, Quantidade, Validade, Id_produto)
VALUES 
("26BR0241", 2, "2026-11-25", 2),
("26BR0184", 3, "2026-06-11", 3),
("L.11-0126B", 1, "2026-03-02", 5),
("LT: 015/26 11:20", 5, "2026-05-12", 4),
("l.52-0326A", 10, "2026-08-04", 2);

CREATE TABLE Lote_movimentacao(
	Id_movimentacao INT NOT NULL,
    Id_lote_produto INT NOT NULL,
    Quantidade INT NOT NULL,
    
    CONSTRAINT FK_IdMovimentacao FOREIGN KEY (Id_movimentacao) REFERENCES Movimentacao(Id_movimentacao),
    CONSTRAINT FK_IdLoteProduto FOREIGN KEY (Id_lote_produto) REFERENCES Lote_produto(Id_lote_produto)
);

INSERT INTO Lote_movimentacao (Id_movimentacao, Id_lote_produto, Quantidade)
VALUES
(2, 4, 5),
(1, 2, 2),
(5, 3, 1),
(3, 1, 4),
(4, 2, 4);

SELECT U.Nome AS AgendadoPara, A.Id_agendamento, A.Data_agendada, A.Tipo AS TipoAgendamento FROM Agendamento A 
LEFT JOIN Usuario U ON A.Id_usuario = U.Id_usuario;

SELECT P.Nome AS NomeProduto, P.Categoria, L.Lote, L.Quantidade, L.Validade FROM Produto P 
RIGHT JOIN Lote_produto L ON P.Id_produto = L.Id_produto;

SELECT U.Nome, F.Data_nasc, F.Cad_unico, U.Email, U.Telefone FROM Usuario U 
RIGHT JOIN Fisico F ON U.Id_usuario = F.Id_usuario;