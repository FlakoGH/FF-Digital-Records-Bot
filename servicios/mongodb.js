const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("❌ MONGODB_URI no está configurada.");
}

const client = new MongoClient(uri);

async function conectarMongoDB() {
    try {
        await client.connect();

        console.log("🍃 MongoDB conectado correctamente.");

        return client;
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:");
        console.error(error.message);

        throw error;
    }
}

module.exports = {
    client,
    conectarMongoDB
};
