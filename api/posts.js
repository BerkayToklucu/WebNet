import mariadb from 'mariadb';

// Veritabanı bağlantı havuzunu oluşturun
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
    
    if (req.method === 'GET') {
      // Veritabanından veri alın
      const rows = await conn.query('SELECT * FROM posts');
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Veritabanına veri ekleyin
      const { content } = req.body;
      await conn.query('INSERT INTO posts (content) VALUES (?)', [content]);
      res.status(201).json({ message: 'Post created' });
    } else if (req.method === 'PUT') {
      // Veritabanındaki veriyi güncelleyin
      const { id, content } = req.body;
      await conn.query('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
      res.status(200).json({ message: 'Post updated' });
    } else if (req.method === 'DELETE') {
      // Veritabanındaki veriyi silin
      const { id } = req.body;
      await conn.query('DELETE FROM posts WHERE id = ?', [id]);
      res.status(200).json({ message: 'Post deleted' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (conn) conn.end();
  }
}
