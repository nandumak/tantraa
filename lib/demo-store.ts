import { z } from 'zod';
import { sampleFood, type Activity } from './food.ts';

export const DEMO_STORAGE_KEY = 'foodrescue.demo.activities.v1';
const diets = ['Vegetarian', 'Non-vegetarian', 'Vegan'] as const;
const kinds = ['donation', 'volunteer', 'organization', 'recipient', 'help', 'claim'] as const;
const activitySchema = z.object({
  id: z.string().min(1), kind: z.enum(kinds), ref: z.string(),
  title: z.string().min(2).max(120), quantity: z.number().int().min(0).max(10000),
  location: z.string().min(2).max(120), diet: z.enum(diets),
  deadline: z.string().datetime().nullable(), notes: z.string().max(600),
  status: z.enum(['available', 'saved', 'claimed', 'picked-up', 'delivered']),
  created_at: z.string().datetime(),
});
const savedSchema = z.object({ version: z.literal(1), activities: z.array(activitySchema) });
const clean = (v: unknown, max = 120) => typeof v === 'string' ? v.trim().slice(0, max) : '';

export function decodeActivities(raw: string | null): Activity[] {
  if (raw === null) return [];
  try { return savedSchema.parse(JSON.parse(raw)).activities; }
  catch { throw new Error('Saved demo data could not be read. Clear FOODRESCUE site data in your browser to start again.'); }
}

export function loadDemoActivities(): Activity[] {
  let raw: string | null;
  try { raw = window.localStorage.getItem(DEMO_STORAGE_KEY); }
  catch { throw new Error('Browser storage is unavailable. Allow site storage to save demo activity.'); }
  return decodeActivities(raw);
}

// Pure transition logic: browser-only demo records, never shared real-world listings.
export function applyDemoAction(
  activities: Activity[], input: Record<string, unknown>,
  now = Date.now(), makeId = () => crypto.randomUUID(),
): Activity[] {
  const action = clean(input.action);
  if (action === 'advance') {
    const record = activities.find(a => a.id === clean(input.id) && a.kind === 'claim');
    if (!record) throw new Error('Pickup not found.');
    if (record.status === 'delivered') return activities;
    if (!['claimed', 'picked-up'].includes(record.status)) throw new Error('This pickup cannot be advanced.');
    return activities.map(a => a.id === record.id
      ? { ...a, status: a.status === 'claimed' ? 'picked-up' : 'delivered' } : a);
  }
  if (action === 'claim') {
    const ref = clean(input.ref);
    const sample = sampleFood.find(f => f.id === ref);
    const donation = activities.find(a => a.id === ref && a.kind === 'donation');
    const food = sample ?? donation;
    if (!food) throw new Error('This food listing is unavailable.');
    if (donation?.deadline && Date.parse(donation.deadline) <= now) throw new Error('The pickup window has ended.');
    if (activities.some(a => a.kind === 'claim' && a.ref === 'claim:' + ref)) return activities;
    const id = makeId();
    return [{ id, kind: 'claim', ref: 'claim:' + ref, title: food.title,
      quantity: food.quantity, location: food.location, diet: food.diet,
      deadline: null, notes: 'Demo pickup', status: 'claimed', created_at: new Date(now).toISOString(),
    }, ...activities];
  }
  if (!['donation', 'volunteer', 'organization', 'recipient', 'help'].includes(action)) throw new Error('Choose a valid action.');
  const title = clean(input.title), location = clean(input.location), notes = clean(input.notes, 600);
  if (title.length < 2 || location.length < 2) throw new Error('Please provide a name or food title and a location.');
  const needsQuantity = ['donation', 'recipient', 'help'].includes(action);
  const quantity = needsQuantity ? Number(input.quantity) : 0;
  if (needsQuantity && (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000)) throw new Error('Enter a quantity between 1 and 10,000.');
  const diet = clean(input.diet) || 'Vegetarian';
  if (!diets.includes(diet as typeof diets[number])) throw new Error('Choose a valid food type.');
  const deadline = action === 'donation' ? clean(input.deadline) : null;
  if (action === 'donation' && (!deadline || !Number.isFinite(Date.parse(deadline)) || Date.parse(deadline) <= now)) throw new Error('Choose a future pickup deadline.');
  const id = makeId();
  const record: Activity = { id, kind: action, ref: id, title, quantity, location, diet,
    deadline: deadline ? new Date(deadline).toISOString() : null, notes,
    status: action === 'donation' ? 'available' : 'saved', created_at: new Date(now).toISOString(),
  };
  return [record, ...activities];
}

export async function saveDemoAction(input: Record<string, unknown>): Promise<Activity[]> {
  const save = () => {
    const activities = applyDemoAction(loadDemoActivities(), input);
    // Validate before persisting, and report quota errors rather than false success.
    const value = savedSchema.parse({ version: 1, activities });
    try { window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(value)); }
    catch { throw new Error('Your demo activity could not be saved. Allow browser storage or free some space, then try again.'); }
    return activities;
  };
  // Serialize writes between tabs where the browser provides Web Locks.
  if (navigator.locks) return navigator.locks.request(DEMO_STORAGE_KEY, save);
  return save();
}
