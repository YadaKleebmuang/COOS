const fs = require('fs');
const path = require('path');

module.exports = (app) => {
  fs.readdirSync(__dirname).forEach((folder) => {
    const fullPath = path.join(__dirname, folder);

    if (!fs.statSync(fullPath).isDirectory()) return;

    if (!folder.startsWith('v')) return;

    const versionRoutes = require(fullPath);
    app.use(`/api/${folder}`, versionRoutes);
  });
};

