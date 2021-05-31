const Vocabulario = require("../models/vocabularioModel");
const factory = require("./handlerFactory");

exports.getAllVocabularios = factory.getAll(Vocabulario);
exports.getVocabulario = factory.getOne(Vocabulario);
exports.createVocabulario = factory.createOne(Vocabulario);
exports.updateVocabulario = factory.updateOne(Vocabulario);
exports.deleteVocabulario = factory.deleteOne(Vocabulario);
