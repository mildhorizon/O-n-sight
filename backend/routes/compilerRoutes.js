const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

router.post('/execute', (req, res) => {
  const { code, language, input } = req.body;

  if (language !== 'cpp') {
    return res.status(400).json({ type: 'error', message: 'Language not supported' });
  }

  const jobId = Date.now();
  const filename = `temp_${jobId}.cpp`;
  const outname = `temp_${jobId}.exe`;
  const inputname = `input_${jobId}.txt`; 
  
  const filepath = path.join(__dirname, '../', filename);
  const outpath = path.join(__dirname, '../', outname);
  const inputpath = path.join(__dirname, '../', inputname);

  fs.writeFileSync(filepath, code);
  fs.writeFileSync(inputpath, input || ""); 

  exec(`g++ "${filepath}" -o "${outpath}"`, (compileError, compileStdout, compileStderr) => {
    
    if (compileError) {
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath); 
        if (fs.existsSync(inputpath)) fs.unlinkSync(inputpath); 
      } catch (e) {
        console.log("Cleanup skipped (Windows File Lock):", e.message);
      }
      return res.json({ type: 'compile_error', output: compileStderr || compileError.message });
    }

    exec(`"${outpath}" < "${inputpath}"`, (runError, runStdout, runStderr) => {
      
      try {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        if (fs.existsSync(inputpath)) fs.unlinkSync(inputpath);
        if (fs.existsSync(outpath)) fs.unlinkSync(outpath);
      } catch (e) {
        console.log("Cleanup skipped (Windows File Lock):", e.message);
      }

      if (runError) {
        return res.json({ type: 'run_error', output: runStderr || runError.message });
      }

      return res.json({ type: 'success', output: runStdout });
    });
  });
});

module.exports = router;