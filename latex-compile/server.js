const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const TEMP_DIR = '/tmp/latex-compile';

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

app.post('/compile', async (req, res) => {
  const { latex_source, file_name } = req.body;

  if (!latex_source || !file_name) {
    return res.status(400).json({ error: 'latex_source and file_name are required' });
  }

  const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const workDir = path.join(TEMP_DIR, `${sanitizedFileName}_${Date.now()}`);
  const texFile = path.join(workDir, `${sanitizedFileName}.tex`);
  const pdfFile = path.join(workDir, `${sanitizedFileName}.pdf`);

  try {
    fs.mkdirSync(workDir, { recursive: true });

    await writeFileAsync(texFile, latex_source, 'utf8');

    const compileCommand = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${workDir}" "${texFile}"`;

    try {
      await execAsync(compileCommand, {
        cwd: workDir,
        timeout: 30000,
      });

      await execAsync(compileCommand, {
        cwd: workDir,
        timeout: 30000,
      });
    } catch (compileError) {
      const logFile = path.join(workDir, `${sanitizedFileName}.log`);
      let errorLog = 'Compilation failed';
      if (fs.existsSync(logFile)) {
        errorLog = await readFileAsync(logFile, 'utf8');
      }
      console.error('LaTeX compilation error:', compileError.message);
      return res.status(500).json({
        error: 'LaTeX compilation failed',
        details: errorLog.substring(0, 1000),
      });
    }

    if (!fs.existsSync(pdfFile)) {
      return res.status(500).json({ error: 'PDF file was not generated' });
    }

    const pdfBuffer = await readFileAsync(pdfFile);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}.pdf"`);
    res.send(pdfBuffer);

    setTimeout(() => {
      try {
        fs.rmSync(workDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }, 5000);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });

    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'latex-compile' });
});

app.listen(PORT, () => {
  console.log(`LaTeX compile service listening on port ${PORT}`);
});
