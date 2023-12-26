import rateLimit from "express-rate-limit"

export const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minuti
   max: 50, // limite di 50 richieste per finestra temporale per IP
   standardHeaders: true, // Restituisci le informazioni sui limiti di rate nel headers
   legacyHeaders: false, // Disabilita l' header 'X-RateLimit-*'
})
