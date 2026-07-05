const axios = require("axios");

async function enviarTexto(numero, mensaje) {

    await axios.post(

        `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,

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

                Authorization: `Bearer ${process.env.TOKEN}`,

                "Content-Type": "application/json"

            }

        }

    );

}

module.exports = {

    enviarTexto

};