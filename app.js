const makeWaSocket = require('@adiwajshing/baileys').default

const { delay, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const { fs, unlink, existsSync, mkdirSync, readFileSync } = require('fs')
const P = require('pino')
const ZDGPath = './ZDGSessions/'
const ZDGAuth = 'auth_info_01.json'


const express = require('express');
const { body, validationResult } = require('express-validator');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');

const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const fsPromises = require("fs/promises");

const port = process.env.PORT || 15001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({
extended: true
}));
app.use(fileUpload({
debug: true
}));

//const SESSION_FILE_PATH = './.wwebjs_auth/session-servidor_001/whatsapp-session.json';
const user = 'servidor_001';
const SESSION_CONTACT_PATH = './contatos-001.json';
const SESSION_CV_PATH = './chats-001.json';
const SESSION_SV_PATH = 'Servidor-1';
const LIMIT_CHAT = '30';
const LIMIT_MSG = '20';
app.get('/', (req, res) => {
  res.sendFile('index.html', {
    root: __dirname
  });
});

io.on("connection", async socket => {
    socket.emit('message', 'Connecting...');

	const { version } = await fetchLatestBaileysVersion()
   
   // Verifica se já existe 
   if (!existsSync(ZDGPath)) {
      mkdirSync(ZDGPath, { recursive: true });
   }
   const { saveState, state } = useSingleFileAuthState(ZDGPath + ZDGAuth)
   // Cofigurações para criar uma sessão nova
   const config = {
      auth: state,
      logger: P({ level: 'error' }),
      printQRInTerminal: true,
      version,
      connectTimeoutMs: 60_000,
      async getMessage(key) {
         return { conversation: 'botzg' };
      },
   }
   // Fim da Cofigurações para criar uma sessão nova
   
   const ZDGsock = makeWaSocket(config);
   ZDGUpdate(ZDGsock.ev);
   ZDGsock.ev.on('creds.update', saveState);
   
	
	
	ZDGsock.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr){
         console.log('© BOT-ZDG - Qrcode: ', qr);
		 socket.emit('qr', qr);
      };
      if (connection === 'close') {
         const ZDGReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
         if (ZDGReconnect) ZDGConnection()
         console.log(`© BOT-ZDG - CONEXÃO FECHADA! RAZÃO: ` + DisconnectReason.loggedOut.toString());
         if (ZDGReconnect === false) {
            const removeAuth = ZDGPath + ZDGAuth
            unlink(removeAuth, err => {
               if (err) throw err
            })
         }
      }
      if (connection === 'open'){
         console.log('© BOT-ZDG -CONECTADO')
      }
   })
	
	
})


//



//
server.listen(port, () => {
    console.log(`http://localhost:${port}`)
})


