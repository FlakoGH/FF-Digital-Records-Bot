const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("❌ MONGODB_URI no está configurada.");
}

const client = new MongoClient(uri);

let db;

async function conectarMongoDB() {
    try {
        await client.connect();

        db = client.db("ff_digital_records");

        console.log("🍃 MongoDB conectado correctamente.");

        return client;
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:");
        console.error(error.message);

        throw error;
    }
}

function obtenerColeccionConversaciones() {
    if (!db) {
        throw new Error("❌ MongoDB todavía no está conectado.");
    }

    return db.collection("conversaciones");
}

module.exports = {
    client,
    conectarMongoDB,
    obtenerColeccionConversaciones
};
