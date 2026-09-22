import { Schema, model, models, type InferSchemaType } from "mongoose";

const briefingLogSchema = new Schema(
  {
    date: { type: String, required: true },
    weather: {
      location: String,
      currentTempC: Number,
      todayMaxC: Number,
      todayMinC: Number,
      condition: String,
    },
    stock: {
      code: String,
      name: String,
      date: String,
      closingPrice: String,
      change: String,
      openingPrice: String,
      highestPrice: String,
      lowestPrice: String,
    },
    news: [
      {
        title: String,
        link: String,
        pubDate: String,
      },
    ],
    summary: {
      weatherSummary: String,
      stockSummary: String,
      newsSummary: String,
      encouragement: String,
    },
    emailId: String,
    sentTo: String,
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type BriefingLogDocument = InferSchemaType<typeof briefingLogSchema>;

export const BriefingLog =
  models.BriefingLog ?? model("BriefingLog", briefingLogSchema);
