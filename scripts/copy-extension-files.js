const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'public');
const targetDir = path.join(__dirname, '..', 'extension-build');

const filesToCopy = [
  'background.js',
  'content.js',
  'sidebar.css',
  'manifest.json',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'icon16.png',
  'icon48.png',
  'icon128.png'
];

// Criar diretório extension-build se não existir
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('Diretório extension-build criado');
}

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);

  try {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ ${file} copiado para extension-build/`);
    } else {
      console.log(`❌ ${file} não encontrado em public/`);
    }
  } catch (error) {
    console.error(`❌ Erro ao copiar ${file}:`, error.message);
  }
});

console.log('✅ Processo de cópia concluído!');
