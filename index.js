const express = require("express");
const axios = require("axios");
const saludos = require("./data/saludos");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FF Digital Records Bot funcionando");
});

const PORT = process.env.PORT || 3000;

const TOKEN = process.env.WHATSAPP_TOKEN;
console.log("Token cargado:", !!TOKEN);
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

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
app.post("/webhook", async (req, res) => {

  console.log("Mensaje recibido");

  const mensaje = req.body.entry?.[0]?.changes?.[0].value?.messages?.[0]?.text?.body;
  
  const texto = mensaje.toLowerCase( ).trim( );

  if (!mensaje) {
  return res.sendStatus(200);
  }
  if (saludos.includes(texto)) {
    console.log("Es un saludo.");
  }
  
  try {
  
  console.log("Mensaje:", mensaje);
    
    await axios.post(
     
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: req.body.entry[0].changes[0].value.contacts[0].wa_id,
        text: {
          body: "¡Hola! Soy el bot de FF Digital Records."
        }
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
      );
    
     res.sendStatus(200);

  } catch (error) {
    
    console.error(error.response?.data || error.message);

    res.sendStatus(500);

  }

});
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
