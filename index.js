const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FF Digital Records Bot funcionando");
});

const PORT = process.env.PORT || 3000;

app.post("/webhook", (req, res) => {

  console.log("Mensaje recibido");

  console.log(req.body);

  res.sendStatus(200);

});
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
