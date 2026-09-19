const axios = require("axios");

async function enviarTexto(numero, mensaje) {
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: numero,
                type: "text",
                text: { body: mensaje }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) {
        console.error("❌ Error enviando mensaje:");
        console.error(error.response?.data || error.message);
        throw error;
    }
}

async function enviarBotones(numero, mensaje, botones) {
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: numero,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: mensaje },
                    action: { buttons: botones }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) {
        console.error("❌ Error enviando botones:");
        console.error(error.response?.data || error.message);
        throw error;
    }
}

async function enviarLista(numero, mensaje, tituloBoton, secciones) {
    try {
        await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: numero,
                type: "interactive",
                interactive: {
                    type: "list",
                    body: {
                        text: mensaje
                    },
                    action: {
                        button: tituloBoton,
                        sections: secciones
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );
    } catch (error) {
        console.error("❌ Error enviando lista:");
        console.error(error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    enviarTexto,
    enviarBotones,
    enviarLista
};
