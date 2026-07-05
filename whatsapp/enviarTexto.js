const axios = require("axios");

async function enviarTexto(numero, mensaje) {

    try {

console.log({
    PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
    TOKEN: !!process.env.WHATSAPP_TOKEN,
TOKEN10: process.env.WHATSAPP_TOKEN?.substring(0, 10)
)}

        await axios.post(

            `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID}/messages`,

            {
                messaging_product: "whatsapp",
                to: numero,
                type: "text",
                text: {
                    body: mensaje
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

        console.error("❌ Error enviando mensaje:");

        console.error(error.response?.data || error.message);

        throw error;

    }

}

module.exports = {

    enviarTexto

};