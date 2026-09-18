import { randomUUID } from "crypto";
import { adsRepository } from "../modules/ads/ads.routes";
import { initiativesRepository } from "../modules/initiatives/initiatives.routes";
import { stateChaptersRepository } from "../modules/state-chapters/state-chapters.routes";
import { seedAdminIfMissing } from "../modules/users/users.service";

function withMeta<T extends object>(item: T) {
  const now = new Date().toISOString();
  return { ...item, id: randomUUID(), createdAt: now, updatedAt: now };
}

/**
 * One-time seed so the site isn't blank the first time it points at this
 * backend — mirrors what's hardcoded in the frontend today (see
 * frontend/src/lib/data/initiatives.ts and frontend/src/lib/stateTeams.ts).
 * `JsonFileRepository.seedIfEmpty` only writes if the collection's JSON
 * file doesn't exist yet, so this is safe to call on every boot.
 *
 * Team members (trustees, management team, advisory board, state
 * leadership/district members — ~40+ people with photos) are intentionally
 * NOT seeded here; there are too many to hand-port safely. Add them via the
 * admin panel, or ask for a one-off import script once real photos/bios are
 * ready.
 */
export async function seedInitialData() {
  await seedAdminIfMissing();

  initiativesRepository.seedIfEmpty(
    [
      { tag: "FOOD SEVA", title: "Annadan (Food Seva)", desc: "Ensuring no one sleeps hungry - one meal, one life at a time.", image: "/images/initiatives/card-01.png", order: 1 },
      { tag: "EDUCATION", title: "Education Support", desc: "Scholarships, mentorship, and resources - because every child deserves to dream.", image: "/images/initiatives/card-02.png", order: 2 },
      { tag: "SWACHH VAHINI", title: "Swachh Vahini", desc: "Promoting cleanliness, hygiene, and environmental care through community-driven initiatives.", image: "/images/initiatives/card-03.png", order: 3 },
      { tag: "GAUSHALA", title: "Gaushala", desc: "Providing shelter, nourishment, and medical care to abandoned and injured cows.", image: "/images/initiatives/card-04.png", order: 4 },
      { tag: "Marriage Bureau", title: "Marriage Bureau", desc: "Connecting hearts through a trusted, values-driven matrimonial platform built for the community.", image: "/images/initiatives/card-05.png", order: 5 },
      { tag: "CARE & SHELTER", title: "Old Age Home", desc: "A safe, dignified, and loving home for our elders - because they deserve nothing less.", image: "/images/initiatives/card-06.png", order: 6 },
    ].map(withMeta),
  );

  stateChaptersRepository.seedIfEmpty(
    [
      { name: "Haryana", slug: "haryana", members: 48 },
      { name: "Punjab", slug: "punjab", members: 24 },
      { name: "Rajasthan", slug: "rajasthan", members: 76 },
      { name: "Uttar Pradesh", slug: "uttar-pradesh", members: 62 },
      { name: "Delhi", slug: "delhi", members: 38 },
      { name: "Maharashtra", slug: "maharashtra", members: 32 },
      { name: "Himachal Pradesh", slug: "himachal-pradesh", members: 19 },
      { name: "Uttarakhand", slug: "uttarakhand", members: 22 },
      { name: "Jammu & Kashmir", slug: "jammu-and-kashmir", members: 14 },
      { name: "Chandigarh", slug: "chandigarh", members: 11 },
      { name: "Bihar", slug: "bihar", members: 29 },
      { name: "Madhya Pradesh", slug: "madhya-pradesh", members: 27 },
    ].map(withMeta),
  );

  // adsRepository is intentionally left empty — no placeholder ad creatives
  // exist yet; the site's AdSlot components simply render nothing until an
  // admin adds one for that placement.
  void adsRepository;
}
