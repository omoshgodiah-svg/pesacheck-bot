const express = require('express');
const app = express();
app.get('/', (req,res)=>res.send('PesaCHECK 24/7 LIVE 🔥'));
app.listen(process.env.PORT || 3000, ()=>console.log('Cloud web server ready'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update

        if(qr) {
            console.log('--- SCAN THIS QR WITH YOUR 0142719180 WHATSAPP ---')
            qrcode.generate(qr, { small: true })
        }

        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('PesaCHECK connected! Bot is LIVE on 0142719180')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if(!msg.message || msg.key.fromMe) return

        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        console.log('Message:', text)

        if(text.toLowerCase().includes('hii') || text.toLowerCase().includes('hello') || text.toLowerCase().includes('hey')) {
            await sock.sendMessage(from, { text: "Welcome to PesaCHECK! ✅\n\nForward your M-Pesa message here to verify it.\n\nExample: Forward any M-Pesa SMS." })
        } else if(text.includes('M-PESA') || text.includes('Confirmed') || text.includes('Ksh')) {
            // M-PESA verification logic here
            await sock.sendMessage(from, { text: `🔍 PesaCHECK Verifying...\n\n${text.substring(0,200)}\n\n✅ Checking amount, code and status...` })
            // Add your real verification later
        } else {
            await sock.sendMessage(from, { text: "Welcome to PesaCHECK! Forward your M-Pesa message here to verify it." })
        }
    })
}

startBot()