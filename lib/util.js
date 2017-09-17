const path = require('path');
const fs   = require('fs');

const loadFileContent = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, content) => {
      if(err) {
        reject(err)
      } else {
        try {
          resolve(content);
        } catch(err) {
          reject(err)
        }
      }
    })
  });
}

const mkdir = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(filepath, (err) => {
      if(err) {
        if(err.code === 'EEXIST') {
          resolve(err.code);
        } else {
          reject(err);
        }
      } else {
        resolve(null);
      }
    });
  });
};

const writeFile = (filepath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, content, 'utf8', (err) => {
      if(err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
};

const ensureJSON = (filepath, json) => {
  const dirname = path.dirname(filepath);

  return mkdir(dirname)
    .then(() => {
      const content = JSON.stringify(json);
      return writeFile(filepath, content);
    });
};

const getFiles = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if(err) {
        reject(err);
      } else {
        resolve(files);
      }
    })
  });
};

module.exports = {
  ensureJSON,
  getFiles,
  loadFileContent,
  mkdir,
  writeFile,
}
