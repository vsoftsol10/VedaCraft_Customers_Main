-- ============================================================
-- VedaCraft Static Product Details Seed
-- Run after seed_static_catalog_no_images.sql.
-- Paste this into Supabase Dashboard -> SQL Editor and run.
-- ============================================================

WITH detail_source (slug, subcategory, section) AS (
  VALUES
    ('coconut-shell-bowl', 'Coconut Shell', 'bestsellers'),
    ('coconut-shell-lamp', 'Coconut Shell', 'newarrivals'),
    ('neem-wood-comb', 'Wood', 'bestsellers'),
    ('cotton-shopping-bag', 'Cotton', 'trending'),
    ('organic-cotton-towels', 'Cotton', 'newarrivals'),
    ('jute-tote-bag', 'Jute', 'bestsellers'),
    ('natural-jute-mat', 'Jute', 'trending'),
    ('bamboo-toothbrush', 'Bamboo', 'bestsellers'),
    ('eco-friendly-totes', 'Cotton', 'trending'),
    ('handcrafted-wooden-bowl', 'Wood', 'newarrivals'),
    ('wooden-cooking-spoon', 'Wood', 'bestsellers'),

    ('aromatherapy-candle', 'Aromatherapy', 'bestsellers'),
    ('essential-oil', 'Aromatherapy', 'bestsellers'),
    ('herbal-tea-pack', 'Supplements & Teas', 'bestsellers'),
    ('herbal-supplements', 'Supplements & Teas', 'bestsellers'),
    ('massage-roller', 'Massage Tools', 'newarrivals'),
    ('meditation-cushion', 'Yoga & Meditation', 'newarrivals'),
    ('organic-face-serum', 'Skincare & Bath', 'newarrivals'),
    ('vegan-soap', 'Skincare & Bath', 'trending'),
    ('skincare-cream', 'Skincare & Bath', 'trending'),
    ('yoga-mat', 'Yoga & Meditation', 'trending'),

    ('organic-almonds', 'Nuts', 'bestsellers'),
    ('fresh-bananas', 'Fresh Produce', 'bestsellers'),
    ('farm-carrots', 'Fresh Produce', 'bestsellers'),
    ('cold-pressed-coconut-oil', 'Oils', 'newarrivals'),
    ('premium-dates', 'Nuts', 'newarrivals'),
    ('raw-forest-honey', 'Honey', 'newarrivals'),
    ('organic-mangoes', 'Fresh Produce', 'trending'),
    ('black-pepper', 'Spices', 'trending'),
    ('fresh-tomatoes', 'Fresh Produce', 'trending'),
    ('turmeric-powder', 'Spices', 'trending'),
    ('organic-millet', 'Grains', 'trending'),
    ('ragi-flour', 'Grains', 'trending'),

    ('cotton-table-runner', 'Weaving', 'bestsellers'),
    ('terracotta-flower-pot', 'Pottery', 'bestsellers'),
    ('handmade-paper-bag', 'Paper Crafts', 'bestsellers'),
    ('iron-candle-holder', 'Metal Art', 'newarrivals'),
    ('metal-wall-hanging', 'Metal Art', 'newarrivals'),
    ('handmade-paper-notebook', 'Paper Crafts', 'newarrivals'),
    ('wooden-storage-box', 'Woodwork', 'trending'),
    ('copper-water-bottle', 'Metal Art', 'trending'),
    ('wooden-spice-box', 'Woodwork', 'trending'),
    ('wooden-wall-shelf', 'Woodwork', 'trending'),

    ('coconut-shell-necklace', 'Handmade Jewelry', 'bestsellers'),
    ('organic-cotton-kurti', 'Cotton Apparel', 'newarrivals'),
    ('handloom-cotton-saree', 'Handloom Sarees', 'bestsellers'),
    ('eco-friendly-cotton-t-shirt', 'Cotton Apparel', 'trending'),
    ('handcrafted-earrings', 'Handmade Jewelry', 'bestsellers'),
    ('sustainable-jute-handbag', 'Eco Bags', 'trending'),
    ('pure-linen-pant', 'Linen Wear', 'newarrivals'),
    ('classic-linen-shirt', 'Linen Wear', 'bestsellers'),

    ('wooden-wall-hanging-art', 'Wall Art', 'bestsellers'),
    ('handcrafted-bamboo-lamp', 'Lighting', 'trending'),
    ('elegant-bamboo-vase', 'Vases & Planters', 'newarrivals'),
    ('ceramic-centerpiece', 'Table Accents', 'bestsellers'),
    ('eco-coconut-shell-lamp', 'Lighting', 'newarrivals'),
    ('handwoven-cotton-rug', 'Rugs & Carpets', 'trending'),
    ('natural-jute-carpet', 'Rugs & Carpets', 'bestsellers'),
    ('rustic-metal-wall-art', 'Wall Art', 'trending'),
    ('minimalist-planter-pot', 'Vases & Planters', 'newarrivals'),
    ('wooden-candle-holder', 'Table Accents', 'bestsellers')
),
prepared_details AS (
  SELECT
    p.id AS product_id,
    ds.subcategory,
    ds.section,
    CASE c.slug
      WHEN 'eco' THEN 'Sustainable everyday essential made with natural, low-impact materials.'
      WHEN 'wellness' THEN 'Natural wellness product designed for mindful self-care and daily balance.'
      WHEN 'food' THEN 'Fresh, naturally sourced food product selected for everyday nourishment.'
      WHEN 'craft' THEN 'Handcrafted artisan product made with traditional skill and thoughtful materials.'
      WHEN 'fashion' THEN 'Conscious fashion piece made for comfort, style, and everyday wear.'
      WHEN 'decor' THEN 'Artisan home decor piece made to add warmth, texture, and character.'
      ELSE 'Natural handcrafted product from VedaCraft.'
    END AS subtitle,
    CASE c.slug
      WHEN 'eco' THEN 'Our ' || p.name || ' is made for people who want useful products without unnecessary waste. It is crafted with natural materials, simple finishing, and a design that fits daily life while supporting eco-conscious choices.'
      WHEN 'wellness' THEN 'Our ' || p.name || ' is created for calm, restorative routines. It uses nature-inspired ingredients or materials and is selected to support relaxation, comfort, and a more mindful lifestyle.'
      WHEN 'food' THEN 'Our ' || p.name || ' is sourced with attention to freshness, purity, and traditional quality. It is a wholesome choice for everyday meals, snacks, and healthier kitchen routines.'
      WHEN 'craft' THEN 'Our ' || p.name || ' is made by skilled artisans using traditional methods and natural materials. Each piece carries small handmade variations that make it unique and meaningful.'
      WHEN 'fashion' THEN 'Our ' || p.name || ' blends craft, comfort, and conscious materials. It is designed for easy styling while supporting slower, more responsible fashion choices.'
      WHEN 'decor' THEN 'Our ' || p.name || ' brings handcrafted texture and natural charm into your home. It is made to complement modern and traditional spaces while celebrating artisan work.'
      ELSE 'Our ' || p.name || ' is carefully selected for quality, sustainability, and everyday usefulness.'
    END AS full_description,
    CASE c.slug
      WHEN 'food' THEN '1. Use as part of your daily meals or snacks.\n2. Store correctly after opening.\n3. Use clean, dry utensils when handling.\n4. Consume within the recommended freshness period.'
      WHEN 'fashion' THEN '1. Wear as part of casual or occasion outfits.\n2. Keep away from harsh chemicals and excess moisture.\n3. Clean gently according to material needs.\n4. Store folded or separately to preserve shape.'
      WHEN 'decor' THEN '1. Place on a stable, clean surface or mount securely.\n2. Keep away from excess moisture.\n3. Dust regularly with a soft cloth.\n4. Handle gently while cleaning or moving.'
      ELSE '1. Use gently for its intended purpose.\n2. Clean with a soft, damp cloth when needed.\n3. Dry fully before storing.\n4. Keep in a cool, dry place.'
    END AS how_to_use,
    CASE c.slug
      WHEN 'food' THEN 'Store in a cool, dry place away from direct sunlight.\nKeep sealed after opening.\nAvoid moisture contact.\nCheck freshness before use.'
      WHEN 'fashion' THEN 'Wash or clean gently.\nAvoid bleach and harsh detergents.\nDry in shade where possible.\nStore in a clean, dry space.'
      WHEN 'decor' THEN 'Avoid prolonged exposure to water, direct harsh sunlight, or high humidity.\nClean with a dry or slightly damp cloth.\nDo not use abrasive cleaners.\nHandle with care.'
      ELSE 'Keep away from excessive moisture and heat.\nAvoid harsh chemical cleaners.\nStore in a dry place.\nDispose responsibly at end of life.'
    END AS core_instructions,
    jsonb_build_array(
      jsonb_build_object('title', 'Natural Materials', 'desc', 'Selected with sustainability and everyday use in mind'),
      jsonb_build_object('title', 'Artisan Quality', 'desc', 'Designed to support handmade and thoughtful production'),
      jsonb_build_object('title', 'Eco Conscious', 'desc', 'A better alternative to mass-produced disposable products'),
      jsonb_build_object('title', 'Everyday Ready', 'desc', 'Practical, durable, and easy to care for')
    ) AS highlights,
    jsonb_build_object(
      'subcategory', ds.subcategory,
      'section', ds.section,
      'mainCategory', c.name,
      'materialNote', 'Images and exact material details can be updated later',
      'origin', 'India'
    ) AS specifications,
    jsonb_build_object(
      'delivery', 'Standard delivery available',
      'cod', true,
      'returnWindowDays', 7,
      'packaging', 'Eco-conscious packaging where available'
    ) AS shipping_info,
    p.name || ' | VedaCraft' AS seo_title,
    'Buy ' || p.name || ' from VedaCraft. Natural, handmade, and conscious products for everyday living.' AS seo_description
  FROM detail_source ds
  JOIN public.products p
    ON p.slug = ds.slug
  JOIN public.categories c
    ON c.id = p.category_id
)
INSERT INTO public.product_details (
  product_id,
  subtitle,
  full_description,
  how_to_use,
  core_instructions,
  highlights,
  specifications,
  shipping_info,
  seo_title,
  seo_description
)
SELECT
  product_id,
  subtitle,
  full_description,
  how_to_use,
  core_instructions,
  highlights,
  specifications,
  shipping_info,
  seo_title,
  seo_description
FROM prepared_details
ON CONFLICT (product_id) DO UPDATE
SET subtitle = EXCLUDED.subtitle,
    full_description = EXCLUDED.full_description,
    how_to_use = EXCLUDED.how_to_use,
    core_instructions = EXCLUDED.core_instructions,
    highlights = EXCLUDED.highlights,
    specifications = EXCLUDED.specifications,
    shipping_info = EXCLUDED.shipping_info,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    updated_at = timezone('utc'::text, now());

SELECT COUNT(*) AS total_product_details FROM public.product_details;
