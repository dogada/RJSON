module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "env": {
      "node": false,
      "browser": true,
    },
    /*"ecmaFeatures": {
      "modules": false,
    },*/
    "rules": {
      "no-console": [2, { allow: ["warn", "error", "err", "log"] }],
      "new-cap": ["error", {"capIsNewExceptions": ["Q", "Q.Promise", "express.Router"]}]
    }
};
