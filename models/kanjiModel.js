const mongoose = require("mongoose");

const kanjiSchema = new mongoose.Schema(
  {
    simbolo: {
      type: String,
      required: [true, "Un kanji debe tener un símbolo"],
      unique: true,
      trim: true,
      maxLength: [1, "Un kanji solo tiene un símbolo"],
    },
    significado: {
      type: String,
      required: [true, "Un kanji debe tener significado"],
    },
    componente: { significado: [String], simbolo: String },
    mnemotecnia: {
      type: String,
      required: [true, "Un kanji debe tener un truco mnemotécnico"],
    },
    radical: { type: String, required: [true, "Un kanji debe tener radical"] },
    radicalesRTK: [{ type: mongoose.Schema.ObjectId, ref: "Kanji" }],
    vocabulario: [{ type: mongoose.Schema.ObjectId, ref: "Vocabulario" }],
    trazos: {
      type: Number,
      required: [true, "Un kanji debe tener un número de trazos"],
    },
    trazosOrden: {
      type: String,
      required: [true, "Un kanji debe tener un orden de trazos"],
    },
    noken: {
      type: Number,
      min: [1, "El Noken no puede ser menor que 1"],
      max: [5, "El Noken no puede ser mayor que 5"],
    },
    onyomi: [String],
    kunyomi: [String],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Kanji = mongoose.model("Kanji", kanjiSchema);

module.exports = Kanji;
