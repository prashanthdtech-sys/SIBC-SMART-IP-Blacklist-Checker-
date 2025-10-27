const express = require("express");
const router = express.Router();
const { blacklistHandler } = require("../Controller/blackListController");

router.get("/blacklist", blacklistHandler);

module.exports = router;
