const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("FF Digital Records Bot funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor iniciado en el puerto ${PORT}');
});
