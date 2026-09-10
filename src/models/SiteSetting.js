import mongoose from "mongoose";

// Key-value store for website content/settings managed via the admin CMS:
//   key: "hero" | "banners" | "site" | "perks"
//   value: arbitrary JSON (validated on write)
const siteSettingSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true, trim: true },
        value: { type: mongoose.Schema.Types.Mixed, default: {} },
        updatedBy: { type: String, default: "admin" },
    },
    { timestamps: true },
);

export default mongoose.models.SiteSetting ||
    mongoose.model("SiteSetting", siteSettingSchema);