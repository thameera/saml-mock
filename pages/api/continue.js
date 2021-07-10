export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  console.log(req.body)

  res.status(200).json({ name: 'John Doe' })
}
