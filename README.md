=====RODANDO O PROJETO=====

1. Baixar e Extrair .ZIP
   
2. Abrir pasta "E-Acess" na IDE desejada (Visual Studio)
  
3. Criar banco de dados "eacess" no POSTGRES, senha de acesso ao Postgres precisa ser "ifsp"

4. Abrir terminal da pasta "backend" e inicializar com: "mvn spring-boot:run"

5. Abrir terminal da pasta "frontend" e baixar dependências com "npm install"

6. Após baixar dependências, inicializar com: "npm run dev"

7. Acessar "http://localhost:5173/"

8. Inserts de Apoio para o Banco:
SELECT * FROM agendamentos;
SELECT * FROM motoristas;
SELECT * FROM transportadoras;
SELECT * FROM usuarios;
SELECT * FROM fretes;

INSERT INTO motoristas (documento, nome) VALUES ('100200300', 'Marcelo');
INSERT INTO transportadoras (nome) VALUES ('DHL');
INSERT INTO fretes (dimensao, distancia, peso, valor) VALUES ('1x1,2x,1,8', 30, 900, 210);
INSERT INTO agendamentos (coleta, data, observacao, placa, status, frete_id, motorista_id, transportadora_id) VALUES
('true', '2026-11-13', 'Lorem Ipsum', 'ABC1234', 'PENDENTE', 1, 1, 1);

=====ORIENTAÇÕES GITHUB=====
