import axios from 'axios'

const client = axios.create({
  baseURL: `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/`,
})
client.interceptors.response.use(
  res => res.data.result,
  err => Promise.reject(err.response.data),
)

export default client
