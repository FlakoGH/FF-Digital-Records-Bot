const express = require("express");
const axios = require("axios");
const saludos = require("./data/saludos");
const logger = require("./logger");
const antiDuplicados = require("./antiDuplicados");
const menu = require("./menus/menuPrincipal");
const menuMusica = require("./menus/menuMusica");
const { enviarTexto } = require("./whatsapp/enviarTexto");
const conversaciones = require("./estado/conversaciones");

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

const numero = req.body.entry[0].changes[0].value.contacts[0].wa_id;

const estadoActual = conversaciones.obtener(numero);

const wamid = mensajeRecibido.id;

if (antiDuplicados.yaProcesado(wamid)) {

    logger.mensajeDuplicado(wamid);

    return res.sendStatus(200);
}

antiDuplicados.guardar(wamid);

if (estadoActual === "menu_principal" && texto === "1") {

    await enviarTexto(numero, menuMusica);

conversaciones.guardar(numero, "menu_musica");

    return res.sendStatus(200);

}

if (estadoActual === "menu_musica" && texto === "0") {

    await enviarTexto(numero, menu);

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);

}

  if (saludos.includes(texto)) {

    logger.nuevoMensaje({
        de: mensajeRecibido.from,
        id: mensajeRecibido.id,
        fecha: new Date(Number(mensajeRecibido.timestamp) * 1000).toLocaleString("es-CO"),
        tipo: mensajeRecibido.type,
        contenido: mensaje,
        accion: "Saludo detectado"
    });

await enviarTexto(numero, menu);

conversaciones.guardar(numero, "menu_principal");

return res.sendStatus(200);

  }
  
  try {
  
  console.log("Mensaje:", mensaje);

console.log("🧠 Estado actual:", estadoActual);

 console.log("EAAQsy5dGe:", TOKEN.substring(0, 10));
    
    await axios.post(
     
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: req.body.entry[0].changes[0].value.contacts[0].wa_id,
        text: {
    body: "🤔 No entendí ese mensaje."
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
