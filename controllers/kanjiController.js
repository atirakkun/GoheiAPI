const Kanji = require("../models/kanjiModel");
const factory = require("./handlerFactory");

exports.getAllKanjis = factory.getAll(Kanji);
exports.getKanji = factory.getOne(Kanji);
exports.createKanji = factory.createOne(Kanji);
exports.updateKanji = factory.updateOne(Kanji);
exports.deleteKanji = factory.deleteOne(Kanji);
