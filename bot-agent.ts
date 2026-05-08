#!/usr/bin/env bun

const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN
const LOCALHOST_URL = process.env.LOCALHOST_URL
console.log({ TG_BOT_TOKEN, LOCALHOST_URL })

function api(method: string, data?: any) {
  return fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data && JSON.stringify(data),
  }).then(res => res.json())
}

void (async function main() {
  if (!TG_BOT_TOKEN || !LOCALHOST_URL) return

  console.log('Start receiving bot updates...')

  let lastUpdateId: number = -1
  while (true) {
    await Promise.allSettled([
      new Promise(resolve => setTimeout(resolve, 1000)),
      (async () => {
        try {
          const data = await api('getUpdates', {
            offset: lastUpdateId + 1,
            timeout: 1,
            allowed_updates: ['message', 'inline_query'],
          })
          if (data.ok) {
            for (const update of data.result) {
              console.log(update)
              try {
                await fetch(`${LOCALHOST_URL}/api/bot-hook`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(update),
                })
              } catch {}
              lastUpdateId = update.update_id
            }
          } else {
            throw new Error(data)
          }
        } catch (err: any) {
          console.error(err.response?.data ?? 'No response error')
        }
      })(),
    ])
  }
})()
