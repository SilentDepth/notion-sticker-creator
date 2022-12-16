const dotenv = require('dotenv')
const axios = require('axios')

dotenv.config({ path: './.env.development.local' })

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN
const PORT = process.env.PORT
console.log({ TG_BOT_TOKEN, PORT })

const http = axios.create()

void async function main () {
  console.log('Start receiving bot updates...')
  let lastUpdateId = -1
  while (true) {
    try {
      const { data } = await http.post(`https://api.telegram.org/bot${TG_BOT_TOKEN}/getUpdates`, {
        offset: lastUpdateId + 1,
        allowed_updates: ['message', 'inline_query'],
      })
      if (data.ok) {
        for (const update of data.result) {
          console.log(update)
          await http.post(`http://localhost:${PORT}/api/bot-hook`, update)
          lastUpdateId = update.update_id
        }
      } else {
        throw new Error(data)
      }
    } catch (err) {
      console.error(err.config ?? err)
    }
  }
}()
