import { z } from "zod";

export const CITIES = ["Минск", "Брест", "Гродно", "Витебск", "Гомель", "Могилёв"] as const;

export const placeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Введите название"),
  name_ru: z.string().optional(),
  name_be: z.string().optional(),
  slug: z.string().min(2, "Введите slug"),
  description: z.string().min(10, "Описание слишком короткое"),
  category: z.enum(["nature", "history", "castles", "museums", "gastro", "activity", "kids"], {
    error: "Выберите категорию",
  }),
  city: z.string().min(2, "Выберите город"),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  working_hours: z.string().optional(),
  entry_price: z.coerce.number().min(0, "Цена не может быть отрицательной").optional(),
  website: z.string().url("Некорректный URL").optional().or(z.literal("")),
  rating: z.coerce.number().min(0, "Рейтинг 0..5").max(5, "Рейтинг 0..5"),
  image_url: z.string().url().optional().or(z.literal("")),
  image_urls: z.string().optional(),
});

export const venueSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Введите название"),
  slug: z.string().min(2, "Введите slug"),
  description: z.string().min(10, "Описание слишком короткое"),
  type: z.enum(["restaurant", "banquet", "loft", "outdoor", "hotel"], {
    error: "Выберите тип",
  }),
  city: z.string().min(2, "Выберите город"),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  capacity_banquet: z.coerce.number().min(0).optional(),
  capacity_buffet: z.coerce.number().min(0).optional(),
  price_from: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const contractorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Введите название"),
  slug: z.string().min(2, "Введите slug"),
  description: z.string().min(10, "Описание слишком короткое"),
  category: z.enum(["photo", "video", "decor", "mc", "sound", "cake", "floral", "anim"], {
    error: "Выберите категорию",
  }),
  city: z.string().min(2, "Выберите город"),
  price_from: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5),
  telegram: z.string().optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const storySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, "Введите заголовок"),
  slug: z.string().min(2, "Введите slug"),
  content: z.string().min(20, "Слишком короткий текст"),
  city: z.string().min(2, "Выберите город"),
  likes: z.coerce.number().min(0).optional(),
  place_id: z.string().uuid().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  city: z.string().min(2),
  venue_id: z.string().uuid().optional().or(z.literal("")),
  date_start: z.string().min(4),
  date_end: z.string().optional().or(z.literal("")),
  price_from: z.coerce.number().min(0).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export const tourSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  city: z.string().min(2),
  duration_hours: z.coerce.number().positive(),
  price: z.coerce.number().min(0),
  languages: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  imageUrl?: string;
};

export const initialActionState: ActionState = {
  success: false,
  message: "",
};

export function slugify(value: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  return value
    .trim()
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

