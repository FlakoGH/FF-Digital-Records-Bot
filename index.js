const express = require("express");
const axios = require("axios");
const saludos = require("./data/saludos");
const logger = require("./logger");

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

const estado = req.body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
const mensajeRecibido = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

const mensaje = req.body.entry?.[0]?.changes?.[0].value?.messages?.[0]?.text?.body;
  
  if (!mensaje) {

    if (estado) {

        logger.estadoMensaje({
            para: estado.recipient_id,
            id: estado.id,
            fecha: new Date(Number(estado.timestamp) * 1000).toLocaleString("es-CO"),
            estado: estado.status
        });

    } else {

        logger.info("⚠ Webhook recibido sin mensaje ni estado.");

    }

    return res.sendStatus(200);
}
  
  const texto = mensaje.toLowerCase( ).trim( );

  if (saludos.includes(texto)) {
    logger.info("👋 Es un saludo.");

await axios.post(
`https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
{
messaging_product: "whatsapp",
to:
req.body.entry[0].changes[0].value.contacts[0].wa_id,
type: "text",
text: {
body:
`👋 ¡Hola!

Bienvenido a FF Digital Records 🎶

Escribe el número de la opción que deseas:

1️⃣ Escuchar música
2️⃣ Spotify
3️⃣ YouTube
4️⃣ Redes sociales
5️⃣ Hablar con un asesor`
}
},
{
headers: {
Authorization: `Bearer ${TOKEN}`,
"Content-Type": "application/json"
}
}
);
return res.sendStatus(200);

  }
  
  try {
  
  console.log("Mensaje:", mensaje);

 console.log("EAAQsy5dGe:", TOKEN.substring(0, 10));
    
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
    
    console.error("Error completo:", error.response?.data);
    console.error("Estado HTTP:", error.response?.status);
    console.error("Mensaje:", error.message);

    res.sendStatus(500);

  }

});
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
