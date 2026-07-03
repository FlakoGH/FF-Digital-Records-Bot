const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FF Digital Records Bot funcionando");
});

const PORT = process.env.PORT || 3000;

app.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === "FFDigital2026") {
    console.log("Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }

});
app.post("/webhook", (req, res) => {

  console.log("Mensaje recibido");

  const mensaje = req.body.entry?.[0]?.changes?.[0].value?.messages?.[0]?.text?.body;

  console.log("Mensaje:", mensaje);
  res.sendStatus(200);

});
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
