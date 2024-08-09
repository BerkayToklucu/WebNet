import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

export default async function handler(req, res) {
  let conn;
  try {
    conn = await pool.getConnection();
    
    if (req.method === 'POST') {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      await conn.query('INSERT INTO posts (content) VALUES (?)', [content]);
      res.status(201).json({ message: 'Post created' });
    } else if (req.method === 'GET') {
      const rows = await conn.query('SELECT * FROM posts ORDER BY created_at DESC');
      res.status(200).json(rows);
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.end();
  }
}
