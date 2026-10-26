const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

let botStatus = 'iniciando'; // Estados: 'iniciando', 'qr', 'conectado'
let qrImageURL = '';

app.get('/', (req, res) => {
    if (botStatus === 'qr' && qrImageURL) {
        res.send(`
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <h2>📱 Escanea este código QR con tu WhatsApp:</h2>
                <img src="${qrImageURL}" style="width:300px;height:300px;"/>
                <p>SERVICIOS WALFEDW - Esperando escaneo...</p>
            </div>
        `);
    } else if (botStatus === 'conectado') {
        res.send(`
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <h1 style="color:green;">🚀 ¡El Bot de SERVICIOS WALFEDW está ONLINE y Conectado!</h1>
            </div>
        `);
    } else {
        res.send(`
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
                <h2>⏳ El Bot se está iniciando en Render...</h2>
                <p>Por favor, recarga esta página en 10-15 segundos para ver el código QR.</p>
            </div>
        `);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    console.log('📱 CÓDIGO QR GENERADO');
    botStatus = 'qr';
    qrcodeTerminal.generate(qr, { small: true });
    
    QRCode.toDataURL(qr, (err, url) => {
        if (!err) qrImageURL = url;
    });
});

client.on('ready', () => {
    console.log('🚀 ¡BOT SERVICIOS WALFEDW ONLINE Y LISTO!');
    botStatus = 'conectado';
    qrImageURL = '';
});

client.on('message', async msg => {
    const text = msg.body.trim().toLowerCase();

    // 1. MENÚ PRINCIPAL
    if (
        text === '0' || 
        text === 'menu' || 
        text === 'menú' || 
        text === 'flasheo'
    ) {
        await msg.reply(
`¡Hola! 👋 Bienvenido a SERVICIOS WALFEDW.

Escribe el *NÚMERO* de la opción que necesitas:

1️⃣ *PS3* (Todas las versiones compatibles)
2️⃣ *PS4* (Soporte hasta versión 13.52)
3️⃣ *PS5* (Soporte hasta versión 13.60)
4️⃣ *Catálogo de Juegos y Parches PES* 🎮
5️⃣ *Ubicación y Entregas* 📍
6️⃣ *Hablar con un asesor en vivo* 👤`
        );
        return;
    }

    // 2. CATÁLOGO / JUEGOS
    if (
        text === '4' || 
        text === 'catalogo' || 
        text === 'catálogo' || 
        text === 'juegos' || 
        text === 'ver juegos' ||
        text === 'lista de juegos' ||
        text === 'pes'
    ) {
        await msg.reply(
`🎮 *Catálogo Completo de Juegos y PES*

Ingresa a nuestra web oficial para revisar todos los títulos disponibles:
🔗 https://walfedw23services.netlify.app/

👉 Si buscas un juego o parche específico, escribe *ASESOR* o *6* para atenderte.`
        );
        return;
    }

    // 3. OPCIÓN PS3
    if (text === '1' || text === 'ps3' || text === 'flasheo ps3') {
        await msg.reply(
`🎮 *Servicio de Flasheo para PS3*

✅ **Compatibilidad:** ¡Cualquier versión y modelo de PS3 es 100% liberable! (Fat, Slim, Super Slim).
• **Incluye:** HEN / Custom Firmware + Tiendas virtuales para descargar juegos gratis directo en la consola.
• **Catálogo de juegos:** https://walfedw23services.netlify.app/

👉 Escribe *AGENDAR* para reservar turno o *6* para hablar con un asesor.`
        );
        return;
    }

    // 4. OPCIÓN PS4
    if (text === '2' || text === 'ps4' || text === 'flasheo ps4') {
        await msg.reply(
`🎮 *Servicio de Flasheo para PS4*

¡Soportamos consolas desde la versión **1.00 hasta la 13.52**!

🔎 **¿Cómo saber si tu PS4 se puede flashear?**
En tu consola ve a: *Configuración ⚙️ ➔ Sistema ➔ Información del Sistema ➔ Versión de Software*.

✍️ **Escríbeme únicamente el número de tu versión** (Ejemplo: *9.00*, *11.00*, *12.50*, *13.52*).`
        );
        return;
    }

    // 5. OPCIÓN PS5
    if (text === '3' || text === 'ps5' || text === 'flasheo ps5') {
        await msg.reply(
`🎮 *Servicio de Flasheo para PS5*

¡Soportamos consolas desde la versión **1.00 hasta la 13.60** (Fat, Slim y PS5 Pro)!

🔎 **Para confirmarte el método:**
En tu PS5 ve a: *Ajustes ⚙️ ➔ Sistema ➔ Información de la consola*.

✍️ **Escríbeme únicamente el número de tu versión** (Ejemplo: *4.51*, *9.00*, *13.60*).`
        );
        return;
    }

    // DETECTOR DE FIRMWARE
    const matchVersion = text.match(/\b(1?\d\.\d\d?)\b/);
    if (matchVersion) {
        const fw = parseFloat(matchVersion[1]);

        if (fw <= 9.00) {
            await msg.reply(
`✅ *¡EXCELENTE NOTICIA!*
Tu versión **${fw}** es *100% COMPATIBLE* (Máxima estabilidad con exploit pOOp/HEN o Kernel clásico).

🎮 **Revisa el catálogo:** https://walfedw23services.netlify.app/
👉 Responde *AGENDAR* para coordinar la entrega o *6* para hablar con un asesor.`
            );
        } else if (fw > 9.00 && fw <= 11.00) {
            await msg.reply(
`✅ *¡EXCELENTE NOTICIA!*
Tu versión **${fw}** es *100% COMPATIBLE* (Exploit PPPwn muy estable).

🎮 **Revisa el catálogo:** https://walfedw23services.netlify.app/
👉 Responde *AGENDAR* para coordinar la entrega o *6* para hablar con un asesor.`
            );
        } else if (fw > 11.00 && fw <= 13.00) {
            await msg.reply(
`✅ *¡EXCELENTE NOTICIA!*
Tu versión **${fw}** es *100% COMPATIBLE* (Inyección digital fácil sin USB/discos vía PlayStation Bue).

🎮 **Revisa el catálogo:** https://walfedw23services.netlify.app/
👉 Responde *AGENDAR* para coordinar la entrega o *6* para hablar con un asesor.`
            );
        } else if (fw > 13.00 && fw <= 13.52) {
            await msg.reply(
`✅ *¡EXCELENTE NOTICIA!*
Tu versión **${fw}** es *COMPATIBLE* (Método reciente Webkit Relapse mediante DNS personalizadas).

🎮 **Revisa el catálogo:** https://walfedw23services.netlify.app/
👉 Responde *AGENDAR* para coordinar la entrega o *6* para hablar con un asesor.`
            );
        } else if (fw > 13.52 && fw <= 13.60) {
            await msg.reply(
`✅ *¡COMPATIBLE EN PS5!*
Tu versión **${fw}** es liberable en PS5 mediante el exploit masivo **Relapse** (Super rápido en Fat, Slim y Pro).

🎮 **Revisa el catálogo:** https://walfedw23services.netlify.app/
👉 Responde *AGENDAR* para coordinar o *6* para asesoría.`
            );
        } else if (fw >= 14.00 && fw <= 14.10) {
            await msg.reply(
`⚠️ Tu versión **${fw}** está en fase **En Desarrollo (Inminente)**.
Ya hay inyección Kernel demostrada. **¡NO ACTUALICES TU CONSOLA!** 

👉 Escribe *6* para hablar con un asesor sobre fechas aproximadas y alternativas.`
            );
        } else if (fw >= 14.20) {
            await msg.reply(
`❌ Tu versión **${fw}** actualmente no se puede flashear (Parchada por Sony).

🎮 Revisa opciones de juegos digitales en nuestro catálogo:
🔗 https://walfedw23services.netlify.app/

👉 Responde *6* si deseas consultar con un asesor.`
            );
        }
        return;
    }

    // 6. UBICACIÓN Y ENTREGAS
    if (
        text === '5' || 
        text === 'ubicacion' || 
        text === 'ubicación' || 
        text === 'donde' || 
        text === 'dónde' ||
        text === 'donde estan' ||
        text === 'dónde están'
    ) {
        await msg.reply(
`📍 *Ubicación y Atención - SERVICIOS WALFEDW*

🏠 **Dirección:**
Rio Chira Mz.P - Lt.28, San Juan de Lurigancho 15434

🗺️ **Google Maps:**
https://www.google.com/maps/place/SERVICIOS+WALFEDW/@-11.9757102,-76.9951135,20z/data=!4m14!1m7!3m6!1s0x9105c5691935eabd:0xcef0367a66be2a69!2sCOMISAR%C3%8DA+MUJERES+CANTO+REY!8m2!3d-11.9759207!4d-76.9956169!16s%2Fg%2F1q5bqjnx3!3m5!1s0x9105c5d65080d6f9:0x397572827e7a1a8d!8m2!3d-11.9756554!4d-76.9951551!16s%2Fg%2F11zwmv06f2?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D

⏰ **Horarios de Atención:**
• Lunes a Viernes: 3:00 PM a 11:00 PM
• Sábados y Domingos: Todo el día (Previa cita)

🛠️ **Modalidad:** Presencial (recepción de la consola).

👉 Responde *AGENDAR* para coordinar tu cita o *6* para hablar con un asesor.`
        );
        return;
    }

    // 7. ASESOR / AGENDAR
    if (
        text === '6' || 
        text === 'agendar' || 
        text === 'asesor' || 
        text === 'tecnico' || 
        text === 'técnico'
    ) {
        await msg.reply(
`👍 ¡Anotado! Le hemos notificado al técnico. Te responderemos personalmente a la brevedad.`
        );
        return;
    }
});

client.initialize();
