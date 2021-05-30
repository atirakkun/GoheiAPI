const mongoose = require("mongoose");

const vocabularioSchema = new mongoose.Schema(
  {
    simbolos: {
      type: String,
      required: [true, "Una palabra debe tener simbolos que la componen"],
    },
    significados: {
      type: [String],
      required: [true, "Una palabra debe tener un significado"],
    },
    kanjis: [{ type: mongoose.Schema.ObjectId, ref: "Kanji" }],
    lecturas: [String],
    noken: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Vocabulario = mongoose.model("Vocabulario", vocabularioSchema);

module.exports = Vocabulario;
