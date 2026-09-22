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
const { enviarTexto, enviarBotones, enviarLista } = require("./whatsapp/enviarTexto");
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
const respuestaLista = mensajeRecibido?.interactive?.list_reply;

const botonId = respuestaBoton?.id || respuestaLista?.id;

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

        await enviarLista(
            numero,
            `🎵 Perfecto.

📋 ¿Con qué distribuidora has lanzado música anteriormente?`,
            "Elegir distribuidora",
            [
                {
                    title: "Distros principales",
                    rows: [
                        {
                            id: "distro_onerpm",
                            title: "OneRPM",
                            description: "Distribución musical"
                        },
                        {
                            id: "distro_distrokid",
                            title: "DistroKid",
                            description: "Distribución independiente"
                        },
                        {
                            id: "distro_symphonic",
                            title: "Symphonic",
                            description: "Distribución y servicios"
                        },
                        {
                            id: "distro_naeku",
                            title: "Naeku",
                            description: "Distribución musical"
                        }
                    ]
                },
                {
                    title: "Más distribuidoras",
                    rows: [
                        {
                            id: "distro_tunecore",
                            title: "TuneCore",
                            description: "Distribución digital"
                        },
                        {
                            id: "distro_cdbaby",
                            title: "CD Baby",
                            description: "Distribución para artistas"
                        },
                        {
                            id: "distro_ditto",
                            title: "Ditto",
                            description: "Distribución independiente"
                        },
                        {
                            id: "distro_amuse",
                            title: "Amuse",
                            description: "Distribución digital"
                        },
                        {
                            id: "distro_believe",
                            title: "Believe",
                            description: "Servicios para artistas"
                        }
                    ]
                },
                {
                    title: "Otra opción",
                    rows: [
                        {
                            id: "distro_otro",
                            title: "Otra distribuidora",
                            description: "Escribir el nombre manualmente"
                        }
                    ]
                }
            ]
        );

        conversaciones.guardar(
            numero,
            "solicitud_distribucion_plataformas"
        );

        return res.sendStatus(200);
    }

    if (botonId === "lanzamientos_no") {

    conversaciones.guardarDato(numero, "ha_lanzado", "No");
    conversaciones.guardarDato(numero, "distribuidora_anterior", "No aplica");

    await enviarTexto(
        numero,
        `🎵 Perfecto.

📝 Ahora cuéntame cualquier información adicional que quieras incluir en tu solicitud de distribución.`
    );

        conversaciones.guardar(
        numero,
        "solicitud_distribucion_info"
    );

    return res.sendStatus(200);
    }
}

if (estadoActual === "solicitud_distribucion_plataformas") {

    console.log("🏢 Distribuidora seleccionada:", botonId);

    const distribuidoras = {
        distro_onerpm: "OneRPM",
        distro_distrokid: "DistroKid",
        distro_symphonic: "Symphonic",
        distro_naeku: "Naeku",
        distro_tunecore: "TuneCore",
        distro_cdbaby: "CD Baby",
        distro_ditto: "Ditto",
        distro_amuse: "Amuse",
        distro_believe: "Believe",
        distro_otro: "Otra distribuidora"
    };

    const distribuidoraSeleccionada = distribuidoras[botonId];

    if (!distribuidoraSeleccionada) {
        return res.sendStatus(200);
    }

    conversaciones.guardarDato(
        numero,
        "distribuidora_anterior",
        distribuidoraSeleccionada
    );

    await enviarTexto(
        numero,
        `🏢 Distribuidora seleccionada: *${distribuidoraSeleccionada}*

📝 Ahora cuéntame cualquier información adicional que quieras incluir en tu solicitud de distribución.`
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_info"
    );

    return res.sendStatus(200);
}
  
  if (estadoActual === "solicitud_distribucion_info") {

    console.log("📝 Información adicional recibida:", mensaje);

    conversaciones.guardarDato(numero, "info_adicional", mensaje.trim());

    const correo = conversaciones.obtenerDato(numero, "correo");
    const nombre = conversaciones.obtenerDato(numero, "nombre");
    const telefono = conversaciones.obtenerDato(numero, "telefono");
    const haLanzado = conversaciones.obtenerDato(numero, "ha_lanzado");
    const distribuidoraAnterior = conversaciones.obtenerDato(
    numero,
    "distribuidora_anterior"
);
    const infoAdicional = conversaciones.obtenerDato(numero, "info_adicional");

    await enviarBotones(
    numero,
    `📋 *Resumen de tu solicitud de distribución*

📧 *Correo:* ${correo}
🎤 *Nombre artístico:* ${nombre}
📱 *Teléfono:* ${telefono}
🎵 *¿Ha lanzado música antes?:* ${haLanzado}
🏢 *Distribuidora anterior:* ${distribuidoraAnterior}
📝 *Información adicional:* ${infoAdicional}

¿Los datos son correctos?`,
    [
        {
            type: "reply",
            reply: {
                id: "solicitud_confirmar",
                title: "✅ Confirmar"
            }
        },
        {
            type: "reply",
            reply: {
                id: "solicitud_editar",
                title: "✏️ Editar"
            }
        }
    ]
);
    conversaciones.guardar(numero, "solicitud_distribucion_confirmacion");

    return res.sendStatus(200);

}

 if (estadoActual === "solicitud_distribucion_confirmacion") {

    console.log("📋 Confirmación de solicitud:", botonId);

    if (botonId === "solicitud_confirmar") {

        await enviarTexto(
            numero,
            `✅ *Solicitud confirmada*

Gracias, ${nombre}. 🎵

Tu solicitud de distribución fue registrada correctamente.

📨 Será revisada por nuestro equipo y posteriormente nos pondremos en contacto contigo.

¡Gracias por confiar en *FF Digital Records*! 🎶`
        );

        await enviarBotones(
            numero,
            `🏠 ¿Qué quieres hacer ahora?`,
            [
                {
                    type: "reply",
                    reply: {
                        id: "volver_inicio",
                        title: "🏠 Volver al inicio"
                    }
                }
            ]
        );

        conversaciones.guardar(
            numero,
            "solicitud_distribucion_completada"
        );

        return res.sendStatus(200);
    }

    if (botonId === "solicitud_editar") {

        console.log("✏️ Editar solicitud seleccionado");

        await enviarTexto(
            numero,
            `✏️ *Editar solicitud*

¿Qué dato quieres modificar?

1️⃣ Correo
2️⃣ Nombre artístico
3️⃣ Número de teléfono
4️⃣ ¿Has lanzado música?
5️⃣ Distribuidora anterior
6️⃣ Información adicional

0️⃣ Cancelar`
        );

               conversaciones.guardar(
    numero,
    "solicitud_distribucion_editar"
);

        return res.sendStatus(200);
    }

}


if (estadoActual === "solicitud_distribucion_editar") {

    console.log("✏️ Opción de edición seleccionada:", texto);

    if (botonId === "solicitud_seguir_editando") {

        console.log("✏️ Seguir editando seleccionado");

        await enviarTexto(
            numero,
            `✏️ *Editar solicitud*

¿Qué dato quieres modificar?

1️⃣ Correo
2️⃣ Nombre artístico
3️⃣ Número de teléfono
4️⃣ ¿Has lanzado música?
5️⃣ Distribuidora anterior
6️⃣ Información adicional

0️⃣ Cancelar`
        );

        return res.sendStatus(200);
    }

    if (texto === "1") {

    const correoActual = conversaciones.obtenerDato(
        numero,
        "correo"
    );

    await enviarTexto(
        numero,
        `📧 *Editar correo*

📌 Correo actual:
${correoActual}

✏️ Escríbeme tu nuevo correo electrónico:`
    );

        conversaciones.guardar(
            numero,
            "solicitud_distribucion_editar_correo"
        );

        return res.sendStatus(200);
    }

  if (texto === "2") {

    const nombreActual = conversaciones.obtenerDato(
        numero,
        "nombre"
    );

    await enviarTexto(
        numero,
        `🎤 *Editar nombre artístico*

📌 Nombre actual:
${nombreActual}

✏️ Escríbeme tu nuevo nombre artístico:`
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar_nombre"
    );

    return res.sendStatus(200);
}

if (texto === "3") {

    const telefonoActual = conversaciones.obtenerDato(
        numero,
        "telefono"
    );

    await enviarTexto(
        numero,
        `📱 *Editar número de teléfono*

📌 Número actual:
${telefonoActual}

✏️ Escríbeme tu nuevo número de teléfono:`
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar_telefono"
    );

    return res.sendStatus(200);
}

if (texto === "4") {

    const haLanzadoActual = conversaciones.obtenerDato(
        numero,
        "ha_lanzado"
    );

    await enviarBotones(
        numero,
        `🎵 *Editar lanzamientos anteriores*

📌 Respuesta actual:
${haLanzadoActual}

¿Has lanzado música anteriormente?`,
        [
            {
                type: "reply",
                reply: {
                    id: "editar_lanzamientos_si",
                    title: "✅ Sí"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "editar_lanzamientos_no",
                    title: "❌ No"
                }
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar_lanzamientos"
    );

    return res.sendStatus(200);
}

if (texto === "5") {

    const haLanzadoActual = conversaciones.obtenerDato(
        numero,
        "ha_lanzado"
    );

    const distribuidoraActual = conversaciones.obtenerDato(
        numero,
        "distribuidora_anterior"
    );

    if (haLanzadoActual === "Sí") {

        await enviarBotones(
            numero,
            `🏢 *Distribuidora anterior*

📌 Actualmente tienes:
${distribuidoraActual}

¿Qué quieres hacer?`,
            [
                {
                    type: "reply",
                    reply: {
                        id: "editar_distribuidora",
                        title: "🏢 Cambiar distribuidora"
                    }
                },
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_seguir_editando",
                        title: "✏️ Seguir editando"
                    }
                },
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_continuar",
                        title: "➡️ Continuar"
                    }
                }
            ]
        );

        return res.sendStatus(200);
    }

    if (haLanzadoActual === "No") {

        await enviarBotones(
            numero,
            `🏢 *Distribuidora anterior*

📌 Actualmente indicaste:
❌ No, no has lanzado música anteriormente.

🏢 Distribuidora anterior:
No aplica

¿Qué quieres hacer?`,
            [
                {
                    type: "reply",
                    reply: {
                        id: "editar_he_distribuido",
                        title: "🎵 Sí, he distribuido"
                    }
                },
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_seguir_editando",
                        title: "✏️ Seguir editando"
                    }
                },
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_continuar",
                        title: "➡️ Continuar"
                    }
                }
            ]
        );

        return res.sendStatus(200);
    }

    return res.sendStatus(200);
}
  
}
  
  if (estadoActual === "solicitud_distribucion_editar_nombre") {

    console.log("🎤 Nuevo nombre artístico recibido:", mensaje);

    conversaciones.guardarDato(
        numero,
        "nombre",
        mensaje.trim()
    );

    await enviarTexto(
        numero,
        `✅ *Nombre artístico actualizado*

🎤 Nuevo nombre artístico:
${mensaje.trim()}`
    );

    await enviarBotones(
        numero,
        `📋 ¿Qué quieres hacer ahora?`,
        [
            {
                type: "reply",
                reply: {
                    id: "solicitud_seguir_editando",
                    title: "✏️ Seguir editando"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "solicitud_continuar",
                    title: "➡️ Continuar"
                }
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar"
    );

    return res.sendStatus(200);
}

  if (estadoActual === "solicitud_distribucion_editar_telefono") {

    console.log("📱 Nuevo teléfono recibido:", mensaje);

    conversaciones.guardarDato(
        numero,
        "telefono",
        mensaje.trim()
    );

    await enviarTexto(
        numero,
        `✅ *Número de teléfono actualizado*

📱 Nuevo número:
${mensaje.trim()}`
    );

    await enviarBotones(
        numero,
        `📋 ¿Qué quieres hacer ahora?`,
        [
            {
                type: "reply",
                reply: {
                    id: "solicitud_seguir_editando",
                    title: "✏️ Seguir editando"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "solicitud_continuar",
                    title: "➡️ Continuar"
                }
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar"
    );

    return res.sendStatus(200);
}
  }

  if (estadoActual === "solicitud_distribucion_editar_lanzamientos") {

    console.log("🎵 Respuesta sobre lanzamientos anteriores:", botonId);

    if (botonId === "editar_lanzamientos_no") {

        conversaciones.guardarDato(
            numero,
            "ha_lanzado",
            "No"
        );

        conversaciones.guardarDato(
            numero,
            "distribuidora_anterior",
            "No aplica"
        );

        await enviarTexto(
            numero,
            `✅ *Lanzamientos anteriores actualizado*

🎵 ¿Ha lanzado música anteriormente?: No

🏢 Distribuidora anterior: No aplica`
        );

        await enviarBotones(
            numero,
            `📋 ¿Qué quieres hacer ahora?`,
            [
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_seguir_editando",
                        title: "✏️ Seguir editando"
                    }
                },
                {
                    type: "reply",
                    reply: {
                        id: "solicitud_continuar",
                        title: "➡️ Continuar"
                    }
                }
            ]
        );

        conversaciones.guardar(
            numero,
            "solicitud_distribucion_editar"
        );

        return res.sendStatus(200);
    }

    if (botonId === "editar_lanzamientos_si") {

        conversaciones.guardarDato(
            numero,
            "ha_lanzado",
            "Sí"
        );

        await enviarLista(
            numero,
            `🎵 *Lanzamientos anteriores actualizado*

📋 ¿Con qué distribuidora has lanzado música anteriormente?`,
            "Elegir distribuidora",
            [
                {
                    title: "Distros principales",
                    rows: [
                        {
                            id: "distro_onerpm",
                            title: "OneRPM",
                            description: "Distribución musical"
                        },
                        {
                            id: "distro_distrokid",
                            title: "DistroKid",
                            description: "Distribución independiente"
                        },
                        {
                            id: "distro_symphonic",
                            title: "Symphonic",
                            description: "Distribución y servicios"
                        },
                        {
                            id: "distro_naeku",
                            title: "Naeku",
                            description: "Distribución musical"
                        }
                    ]
                },
                {
                    title: "Más distribuidoras",
                    rows: [
                        {
                            id: "distro_tunecore",
                            title: "TuneCore",
                            description: "Distribución digital"
                        },
                        {
                            id: "distro_cdbaby",
                            title: "CD Baby",
                            description: "Distribución para artistas"
                        },
                        {
                            id: "distro_ditto",
                            title: "Ditto",
                            description: "Distribución independiente"
                        },
                        {
                            id: "distro_amuse",
                            title: "Amuse",
                            description: "Distribución digital"
                        },
                        {
                            id: "distro_believe",
                            title: "Believe",
                            description: "Servicios para artistas"
                        }
                    ]
                },
                {
                    title: "Otra opción",
                    rows: [
                        {
                            id: "distro_otro",
                            title: "Otra distribuidora",
                            description: "Escribir el nombre manualmente"
                        }
                    ]
                }
            ]
        );

        conversaciones.guardar(
            numero,
            "solicitud_distribucion_editar_lanzamientos_distro"
        );

        return res.sendStatus(200);
    }

    return res.sendStatus(200);
}
 
if (estadoActual === "solicitud_distribucion_editar_lanzamientos_distro") {

    console.log("🏢 Nueva distribuidora seleccionada:", botonId);

    const distribuidoras = {
        distro_onerpm: "OneRPM",
        distro_distrokid: "DistroKid",
        distro_symphonic: "Symphonic",
        distro_naeku: "Naeku",
        distro_tunecore: "TuneCore",
        distro_cdbaby: "CD Baby",
        distro_ditto: "Ditto",
        distro_amuse: "Amuse",
        distro_believe: "Believe",
        distro_otro: "Otra distribuidora"
    };

    const distribuidoraSeleccionada = distribuidoras[botonId];

    if (!distribuidoraSeleccionada) {
        return res.sendStatus(200);
    }

    conversaciones.guardarDato(
        numero,
        "distribuidora_anterior",
        distribuidoraSeleccionada
    );

    await enviarTexto(
        numero,
        `✅ *Distribuidora actualizada*

🏢 Nueva distribuidora:
${distribuidoraSeleccionada}`
    );

    await enviarBotones(
        numero,
        `📋 ¿Qué quieres hacer ahora?`,
        [
            {
                type: "reply",
                reply: {
                    id: "solicitud_seguir_editando",
                    title: "✏️ Seguir editando"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "solicitud_continuar",
                    title: "➡️ Continuar"
                }
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar"
    );

    return res.sendStatus(200);
}

if (botonId === "editar_he_distribuido") {

    console.log("🎵 El usuario indicó que sí ha distribuido anteriormente");

    conversaciones.guardarDato(
        numero,
        "ha_lanzado",
        "Sí"
    );

    await enviarTexto(
        numero,
        `🎵 Has indicado que sí has lanzado/distribuido música anteriormente.`
    );

    await enviarLista(
        numero,
        `📋 ¿Con qué distribuidora has lanzado música anteriormente?`,
        "Elegir distribuidora",
        [
            {
                title: "Distros principales",
                rows: [
                    {
                        id: "distro_onerpm",
                        title: "OneRPM",
                        description: "Distribución musical"
                    },
                    {
                        id: "distro_distrokid",
                        title: "DistroKid",
                        description: "Distribución independiente"
                    },
                    {
                        id: "distro_symphonic",
                        title: "Symphonic",
                        description: "Distribución y servicios"
                    },
                    {
                        id: "distro_naeku",
                        title: "Naeku",
                        description: "Distribución musical"
                    }
                ]
            },
            {
                title: "Más distribuidoras",
                rows: [
                    {
                        id: "distro_tunecore",
                        title: "TuneCore",
                        description: "Distribución digital"
                    },
                    {
                        id: "distro_cdbaby",
                        title: "CD Baby",
                        description: "Distribución para artistas"
                    },
                    {
                        id: "distro_ditto",
                        title: "Ditto",
                        description: "Distribución independiente"
                    },
                    {
                        id: "distro_amuse",
                        title: "Amuse",
                        description: "Distribución digital"
                    },
                    {
                        id: "distro_believe",
                        title: "Believe",
                        description: "Servicios para artistas"
                    }
                ]
            },
            {
                title: "Otra opción",
                rows: [
                    {
                        id: "distro_otro",
                        title: "Otra distribuidora",
                        description: "Distribución musical"
                    }
                ]
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar_lanzamientos_distro"
    );

    return res.sendStatus(200);
}

if (botonId === "editar_distribuidora") {

    const distribuidoraActual = conversaciones.obtenerDato(
        numero,
        "distribuidora_anterior"
    );

    await enviarTexto(
        numero,
        `🏢 *Editar distribuidora anterior*

📌 Actualmente tienes:
${distribuidoraActual}

✏️ Vamos a actualizar este dato.`
    );

    await enviarLista(
        numero,
        `📋 ¿Con qué distribuidora has lanzado música anteriormente?`,
        "Elegir distribuidora",
        [
            {
                title: "Distros principales",
                rows: [
                    {
                        id: "distro_onerpm",
                        title: "OneRPM",
                        description: "Distribución musical"
                    },
                    {
                        id: "distro_distrokid",
                        title: "DistroKid",
                        description: "Distribución independiente"
                    },
                    {
                        id: "distro_symphonic",
                        title: "Symphonic",
                        description: "Distribución y servicios"
                    },
                    {
                        id: "distro_naeku",
                        title: "Naeku",
                        description: "Distribución musical"
                    }
                ]
            },
            {
                title: "Más distribuidoras",
                rows: [
                    {
                        id: "distro_tunecore",
                        title: "TuneCore",
                        description: "Distribución digital"
                    },
                    {
                        id: "distro_cdbaby",
                        title: "CD Baby",
                        description: "Distribución para artistas"
                    },
                    {
                        id: "distro_ditto",
                        title: "Ditto",
                        description: "Distribución independiente"
                    },
                    {
                        id: "distro_amuse",
                        title: "Amuse",
                        description: "Distribución digital"
                    },
                    {
                        id: "distro_believe",
                        title: "Believe",
                        description: "Servicios para artistas"
                    }
                ]
            },
            {
                title: "Otra opción",
                rows: [
                    {
                        id: "distro_otro",
                        title: "Otra distribuidora",
                        description: "Distribución musical"
                    }
                ]
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar_lanzamientos_distro"
    );

    return res.sendStatus(200);
}
  
  if (botonId === "solicitud_continuar") {

    console.log("➡️ Continuar seleccionado");

    const correo = conversaciones.obtenerDato(numero, "correo");
    const nombreArtistico = conversaciones.obtenerDato(numero, "nombre");
    const telefono = conversaciones.obtenerDato(numero, "telefono");
    const haLanzado = conversaciones.obtenerDato(numero, "ha_lanzado");
    const distribuidoraAnterior = conversaciones.obtenerDato(
        numero,
        "distribuidora_anterior"
    );
    const infoAdicional = conversaciones.obtenerDato(
        numero,
        "info_adicional"
    );

    await enviarBotones(
        numero,
        `📋 *Resumen actualizado de tu solicitud*

📧 *Correo:* ${correo}
🎤 *Nombre artístico:* ${nombreArtistico}
📱 *Teléfono:* ${telefono}
🎵 *¿Ha lanzado música antes?:* ${haLanzado}
🏢 *Distribuidora anterior:* ${distribuidoraAnterior}
📝 *Información adicional:* ${infoAdicional}

¿Los datos son correctos?`,
        [
            {
                type: "reply",
                reply: {
                    id: "solicitud_confirmar",
                    title: "✅ Confirmar"
                }
            },
            {
                type: "reply",
                reply: {
                    id: "solicitud_editar",
                    title: "✏️ Editar"
                }
            }
        ]
    );

    conversaciones.guardar(
        numero,
        "solicitud_distribucion_confirmacion"
    );

    return res.sendStatus(200);
}
  
   if (estadoActual === "solicitud_distribucion_editar_correo") {

    console.log("📧 Nuevo correo recibido:", mensaje);

    conversaciones.guardarDato(
        numero,
        "correo",
        mensaje.trim()
    );

    await enviarTexto(
    numero,
    `✅ *Correo actualizado*

📧 Nuevo correo:
${mensaje.trim()}`
);

await enviarBotones(
    numero,
    `📋 ¿Qué quieres hacer ahora?`,
    [
        {
            type: "reply",
            reply: {
                id: "solicitud_seguir_editando",
                title: "✏️ Seguir editando"
            }
        },
        {
            type: "reply",
            reply: {
                id: "solicitud_continuar",
                title: "➡️ Continuar"
            }
        }
    ]
);
    conversaciones.guardar(
        numero,
        "solicitud_distribucion_editar"
    );

    return res.sendStatus(200);
}
   
if (estadoActual === "solicitud_distribucion_completada") {

    console.log("🏠 Volver al inicio seleccionado:", botonId);

    if (botonId === "volver_inicio") {

        await enviarTexto(
            numero,
            menu(nombre)
        );

        conversaciones.guardar(
            numero,
            "menu_principal"
        );

        return res.sendStatus(200);
    }

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
