const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA routing - all routes redirect to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     Kripto Haber Mobil Frontend Server                       ║
║                                                              ║
║  Server running on: http://localhost:${PORT}                       ║
║  Serving: dist/                                              ║
║  SPA Routing: Enabled                                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

