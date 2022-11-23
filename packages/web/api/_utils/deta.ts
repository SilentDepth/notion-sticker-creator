import axios from 'axios'

const client = axios.create({
  baseURL: `https://database.deta.sh/v1/${process.env.DETA_PROJECT_ID}/`,
  headers: {
    'x-api-key': process.env.DETA_PROJECT_KEY!,
  },
})
client.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response.data),
)

export default client
