import { industries } from "../data/industries";
import { saveIndustryToSupabase } from "../services/industryAdminService";

export async function seedIndustries() {
    console.log("Starting industry seeding...");
    for (const industry of industries) {
        console.log(`Seeding ${industry.name}...`);
        const { ok, error } = await saveIndustryToSupabase(industry);
        if (!ok) {
            console.error(`Failed to seed ${industry.name}:`, error);
        } else {
            console.log(`Successfully seeded ${industry.name}`);
        }
    }
    console.log("Seeding complete.");
}
