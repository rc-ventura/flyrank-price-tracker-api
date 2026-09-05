import {z} from 'zod';
 
// "£51.77" → 51.77 — raw text is kept alongside the clean number
export const normalizePrice = (priceText) => {
    const value = Number.parseFloat(priceText.replace(/[^0-9.]/g, ''));
    return Number.isFinite(value) ? value : null;
};
 
export const bookSchema = z.object({
    title: z.string().min(1),
    product_url: z.url().startsWith('https://'),
    price_text: z.string().min(1),
    price_gbp: z.number().positive(),
    availability_text: z.string().min(1),
    rating_text: z.string().min(1).nullable(),
    description: z.string().nullable(),
    source_page: z.url().startsWith('https://'),
    fetched_at: z.iso.datetime(),
});

// raw record → {ok: true, data} | {ok: false, url, reason}
export const normalizeAndValidate = (raw) => {
    const cleaned = {
        ...raw,
        price_gbp: raw.price_text ? normalizePrice(raw.price_text) : null,
    };
 
    const result = bookSchema.safeParse(cleaned);
    if (result.success) return {ok: true, data: result.data};
 
    const reason = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
    return {ok: false, url: raw.product_url, reason};
};