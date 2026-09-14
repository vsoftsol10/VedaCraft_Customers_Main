import { supabase } from '../lib/supabase';

/** Returns the categories displayed on the homepage, maintained in Supabase. */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, image_url, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []).map((category) => ({
    ...category,
    image: category.image_url,
  }));
}
