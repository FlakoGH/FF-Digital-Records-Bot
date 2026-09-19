const express = require("express");
const axios = require("axios");
const saludos = require("./data/saludos");
const logger = require("./logger");
const antiDuplicados = require("./antiDuplicados");
const menu = require("./menus/menuPrincipal");
const menuMusica = require("./menus/menuMusica");
const menuRedes = require("./menus/menuRedes");
const menuReleases = require("./menus/menuReleases");
const menuContacto = require("./menus/menuContacto");
const { enviarTexto, enviarBotones } = require("./whatsapp/enviarTexto");
const conversaciones = require("./estado/conversaciones");
const linksMusica = require("./links/musica");
const linksRedes = require("./links/redes");
const linksReleases = require("./links/releases");
const linksContacto = require("./links/contacto");

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

const mensaje = mensajeRecibido?.text?.body;

const respuestaBoton = mensajeRecibido?.interactive?.button_reply;

const botonId = respuestaBoton?.id;

const texto = mensaje?.toLowerCase().trim();

if (!mensajeRecibido) {

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

const numero = req.body.entry[0].changes[0].value.contacts[0].wa_id;

  const nombre = req.body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "amigo";

const estadoActual = conversaciones.obtener(numero);

const wamid = mensajeRecibido.id;

if (antiDuplicados.yaProcesado(wamid)) {

    logger.mensajeDuplicado(wamid);

    return res.sendStatus(200);
}

antiDuplicados.guardar(wamid);

console.log("👤 Nombre del perfil:", nombre);
  
  logger.nuevoMensaje({
        de: mensajeRecibido.from,
        id: mensajeRecibido.id,
        fecha: new Date(Number(mensajeRecibido.timestamp) * 1000).toLocaleString("es-CO"),
        tipo: mensajeRecibido.type,
        contenido: mensaje,
        accion: "Mensaje Recibido"
    });


if (estadoActual === "menu_principal" && texto === "1") {
  
  console.log("📂 Menú seleccionado: Música");

    await enviarTexto(numero, menuMusica);

conversaciones.guardar(numero, "menu_musica");

    return res.sendStatus(200);

}

  if (estadoActual === "menu_principal" && texto === "2") {

    console.log("📂 Menú seleccionado: Redes");

    await enviarTexto(numero, menuRedes);

    conversaciones.guardar(numero, "menu_redes");

    return res.sendStatus(200);

}
  
if (estadoActual === "menu_principal" && texto === "5") {

  console.log("📂 Menú seleccionado: Contactos");

    await enviarTexto(numero, menuContacto);

    conversaciones.guardar(numero, "menu_contacto");

    return res.sendStatus(200);

}

if (estadoActual === "menu_principal" && texto === "4") {

  console.log("📂 Menú seleccionado: Releases");

    await enviarTexto(numero, menuReleases);

    conversaciones.guardar(numero, "menu_releases");

    return res.sendStatus(200);

}

  if (estadoActual === "menu_musica" && texto === "1") {

    console.log("🎵 Plataforma: Spotify");

    await enviarTexto(
        numero,
        `🎧 *Spotify*\n\n${linksMusica.spotify}`
    );

    return res.sendStatus(200);
}

if (estadoActual === "menu_musica" && texto === "2") {

    console.log("🎥 Plataforma seleccionada: YouTube");

    await enviarTexto(
        numero,
        "▶️ *YouTube*\n\nhttps://music.youtube.com/@FlakoFlow_25"
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_musica" && texto === "3") {

    console.log("🎧 Plataforma seleccionada: Deezer");

    await enviarTexto(
        numero,
        "🎧 *Deezer*\n\nhttps://www.deezer.com/mx/artist/280286001"
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_musica" && texto === "4") {

    console.log("🍎 Plataforma seleccionada: Apple Music");

    await enviarTexto(
        numero,
        "🍎 *Apple Music*\n\nhttps://music.apple.com/co/artist/dj-flako-flow/1765989879"
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_musica" && texto === "5") {

    console.log("🎵 Plataforma seleccionada: Amazon Music");

    await enviarTexto(
        numero,
        "🎵 *Amazon Music*\n\nhttps://music.amazon.com/es-co/artists/B0DFXBX75L/dj-flako-flow"
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_musica" && texto === "6") {

    console.log("🌍 Plataforma seleccionada: Todas las plataformas");

    await enviarTexto(
        numero,
        "🌍 *Todas las plataformas*\n\nhttps://beacons.ai/djflakoflow"
    );

    return res.sendStatus(200);

}
  
if (estadoActual === "menu_musica" && texto === "0") {

  console.log("🏠 Regresando al menú principal");

    await enviarTexto(numero, menu(nombre));

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);

}

if (texto === "99") {

    console.log("🏠 Inicio solicitado");

    await enviarTexto(numero, menu(nombre));

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);

}

  if (estadoActual === "menu_redes" && texto === "1") {

    console.log("📸 Red seleccionada: Instagram");

    await enviarTexto(
        numero,
        `📸 *Instagram*\n\n${linksRedes.instagram}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_redes" && texto === "2") {

    console.log("📘 Red seleccionada: Facebook");

    await enviarTexto(
        numero,
        `📘 *Facebook*\n\n${linksRedes.facebook}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_redes" && texto === "3") {

    console.log("✈️ Red seleccionada: Telegram");

    await enviarTexto(
        numero,
        `✈️ *Telegram*\n\n${linksRedes.telegram}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_redes" && texto === "4") {

    console.log("💬 Red seleccionada: Canal de WhatsApp");

    await enviarTexto(
        numero,
        `💬 *Canal de WhatsApp*\n\n${linksRedes.canalWhatsapp}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_redes" && texto === "5") {

    console.log("🎵 Red seleccionada: TikTok");

    await enviarTexto(
        numero,
        `🎵 *TikTok*\n\n${linksRedes.tiktok}`
    );

    return res.sendStatus(200);

}
  
  if (estadoActual === "menu_redes" && texto === "0") {

    console.log("🏠 Regresando al menú principal");

    await enviarTexto(numero, menu(nombre));

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);
}

  if (estadoActual === "menu_contacto" && texto === "2") {

    console.log("💬 Contacto seleccionado: WhatsApp personal");

    await enviarTexto(
        numero,
        `💬 *WhatsApp personal*\n\n${linksContacto.whatsapp}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_contacto" && texto === "3") {

    console.log("📧 Contacto seleccionado: Correo del sello");

    await enviarTexto(
        numero,
        `📧 *Correo del sello*\n\n${linksContacto.correoSello}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_contacto" && texto === "4") {

    console.log("🎵 Contacto seleccionado: Correo artístico");

    await enviarTexto(
        numero,
        `🎵 *Correo artístico*\n\n${linksContacto.correoArtistico}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_contacto" && texto === "5") {

    console.log("📋 Contacto seleccionado: Solicitar distribución");

    await enviarTexto(
        numero,
        `📋 *Solicitud de distribución*

Perfecto, ${nombre}. 🎵

Para ayudarte con tu solicitud de distribución, vamos a recopilar algunos datos.

📧 Primero, escríbeme tu correo electrónico:`
    );

    conversaciones.guardar(numero, "solicitud_distribucion_correo");

    return res.sendStatus(200);

}

  if (estadoActual === "solicitud_distribucion_correo") {

    console.log("📧 Correo recibido:", mensaje);

    conversaciones.guardarDato(numero, "correo", mensaje.trim());

    await enviarTexto(
        numero,
        `📧 Correo recibido correctamente.

🎤 Ahora escríbeme tu *nombre artístico*:`
    );

    conversaciones.guardar(numero, "solicitud_distribucion_nombre");

    return res.sendStatus(200);

}

  if (estadoActual === "solicitud_distribucion_nombre") {

    console.log("🎤 Nombre artístico recibido:", mensaje);

    conversaciones.guardarDato(numero, "nombre", mensaje.trim());

    await enviarTexto(
        numero,
        `🎤 Nombre artístico recibido correctamente.

📱 Ahora escríbeme tu *número de teléfono*:`
    );

    conversaciones.guardar(numero, "solicitud_distribucion_telefono");

    return res.sendStatus(200);

}

  if (estadoActual === "solicitud_distribucion_telefono") {

    console.log("📱 Teléfono recibido:", mensaje);

    conversaciones.guardarDato(numero, "telefono", mensaje.trim());

    await enviarBotones(
        numero,
        `📱 Teléfono recibido correctamente.

🎵 ¿Has lanzado música anteriormente?`,
        [
            {
                type: "reply",
                reply: {
                    id: "lanzamientos_si",
                    title: "✅ Sí"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "lanzamientos_no",
                    title: "❌ No"
                }
            }
        ]
    );

    conversaciones.guardar(numero, "solicitud_distribucion_lanzamientos");

    return res.sendStatus(200);

}

  if (estadoActual === "solicitud_distribucion_lanzamientos") {

    console.log("🎵 Respuesta sobre lanzamientos:", botonId);

    if (botonId === "lanzamientos_si") {

        conversaciones.guardarDato(numero, "ha_lanzado", "Sí");

    }

    if (botonId === "lanzamientos_no") {

        conversaciones.guardarDato(numero, "ha_lanzado", "No");

    }

    await enviarTexto(
        numero,
        `🎵 Perfecto.

📝 Ahora cuéntame cualquier información adicional que quieras incluir en tu solicitud de distribución.`
    );

    conversaciones.guardar(numero, "solicitud_distribucion_info");

    return res.sendStatus(200);

}

  if (estadoActual === "solicitud_distribucion_info") {

    console.log("📝 Información adicional recibida:", mensaje);

    conversaciones.guardarDato(numero, "info_adicional", mensaje.trim());

    const correo = conversaciones.obtenerDato(numero, "correo");
    const nombre = conversaciones.obtenerDato(numero, "nombre");
    const telefono = conversaciones.obtenerDato(numero, "telefono");
    const haLanzado = conversaciones.obtenerDato(numero, "ha_lanzado");
    const infoAdicional = conversaciones.obtenerDato(numero, "info_adicional");

    await enviarTexto(
        numero,
        `📋 *Resumen de tu solicitud de distribución*

📧 Correo: ${correo}
🎤 Nombre artístico: ${nombre}
📱 Teléfono: ${telefono}
🎵 ¿Ha lanzado música antes?: ${haLanzado}
📝 Información adicional: ${infoAdicional}

¿Los datos son correctos?`
    );

    conversaciones.guardar(numero, "solicitud_distribucion_confirmacion");

    return res.sendStatus(200);

}

if (estadoActual === "menu_contacto" && texto === "0") {

  console.log("🏠 Regresando al menú principal");

    await enviarTexto(numero, menu(nombre));

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);

}

if (estadoActual === "menu_releases" && texto === "1") {

    console.log("💿 Release seleccionado: Último lanzamiento");

    await enviarTexto(
        numero,
        `💿 *Último lanzamiento*\n\n${linksReleases.ultimo}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_releases" && texto === "2") {

    console.log("📀 Release seleccionado: Catálogo completo");

    await enviarTexto(
        numero,
        `📀 *Catálogo completo*\n\n${linksReleases.catalogo}`
    );

    return res.sendStatus(200);

}

  if (estadoActual === "menu_releases" && texto === "3") {

    console.log("🚀 Release seleccionado: Próximos lanzamientos");

    await enviarTexto(
        numero,
        `🚀 *Próximos lanzamientos*\n\n${linksReleases.proximos}`
    );

    return res.sendStatus(200);

}
  
if (estadoActual === "menu_releases" && texto === "0") {

  console.log("🏠 Regresando al menú principal");

    await enviarTexto(numero, menu(nombre));

    conversaciones.guardar(numero, "menu_principal");

    return res.sendStatus(200);

}

  if (saludos.includes(texto)) {

await enviarTexto(numero, menu(nombre));

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
