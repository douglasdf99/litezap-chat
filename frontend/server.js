// Importa os módulos necessários
const express = require("express");
const path = require("path");
const helmet = require("helmet"); // Helmet para cabeçalhos de segurança

// Inicializa a aplicação Express
const app = express();

// Adiciona o Helmet para melhorar a segurança com cabeçalhos HTTP
app.use(helmet());

// Configura o diretório estático para servir os arquivos do build
app.use(express.static(path.join(__dirname, "build")));

// Rota principal para servir o index.html
app.get("/*", (req, res, next) => {
  try {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  } catch (error) {
    console.error('Erro ao servir o arquivo:', error);
    res.status(400).send("Bad Request");
  }
});

// Middleware para capturar URIErrors e outros erros
app.use((err, req, res, next) => {
  if (err instanceof URIError) {
    console.error("Erro ao decodificar o parâmetro:", err);
    return res.status(400).send("Bad Request");
  }
  next(err); // Passa outros tipos de erro para o próximo middleware, se existir
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
