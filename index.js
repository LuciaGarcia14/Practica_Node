const http = require("http");
const fs = require("fs");
const { MongoClient } = require("mongodb");

const urlConexion = "mongodb://127.0.0.1:27017";
const bd = "harry";
const coleccion = "personajes";
const puerto = 8080;

const server = http.createServer();

server.on("request", async function (peticion, respuesta) {
    const urlCompleta = new URL(peticion.url, `http://${peticion.headers.host}`);
    const pathname = urlCompleta.pathname;

    if (pathname === "/importar") {
        try {
            if (peticion.method === "GET") {
                // Leer el archivo HTML y enviarlo como respuesta
                const data = fs.readFileSync("personajes.html", "utf8");
                respuesta.writeHead(200, { "Content-Type": "text/html" });
                respuesta.end(data);
            } else if (peticion.method === "POST") {
                // Consultar la base de datos y enviar los resultados como respuesta
                await consultarColeccion(bd, coleccion, respuesta);
            }
        } catch (error) {
            console.error("Error al manejar la solicitud:", error);
            respuesta.writeHead(500);
            respuesta.end("Error interno del servidor");
        }
    } else {
        // Ruta no encontrada
        respuesta.writeHead(404);
        respuesta.end("Ruta no encontrada");
    }
});

async function consultarColeccion(bd, coleccion, respuesta) {
    const cliente = new MongoClient(urlConexion);
    try {
        await cliente.connect();
        const db = cliente.db(bd);
        const resultado = await db.collection(coleccion).find({}).toArray();
        respuesta.writeHead(200, { "Content-Type": "application/json" });
        respuesta.end(JSON.stringify(resultado));
    } catch (error) {
        console.error("Error al consultar la colección:", error);
        respuesta.writeHead(500);
        respuesta.end("Error interno del servidor al consultar la colección");
    } finally {
        await cliente.close();
    }
}

server.listen(puerto, "127.0.0.1", () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${puerto}`);
});
