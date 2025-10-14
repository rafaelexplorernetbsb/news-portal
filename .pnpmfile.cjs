function readPackage(pkg) {
  // Remover restrições de engines para permitir Node.js 24+
  if (pkg.engines) {
    delete pkg.engines.node;
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};

