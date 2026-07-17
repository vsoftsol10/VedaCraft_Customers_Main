import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Share2, Leaf, HeartPulse, Sparkles, Sprout, Minus, Plus, ShieldCheck, Flame, Droplets, Wind, Gem, Palette, Recycle, Sun, Package, Coffee, Flower2, Zap, Award, HandHeart, Shirt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProductTabs from '../components/Products/ProductTabs';
import ReviewCard from '../components/Products/ReviewCard';
import ProductSection from '../components/Products/ProductSection';
import WishlistButton from '../components/Products/WishlistButton';
import { useCart } from '../context/CartContext';
import { getProductBySlug, getProductDetails, getProductsByCategory } from '../services/productApi';
import { mapApiProductToProduct } from '../types/product';
import { allProducts } from '../data/allProducts';
function getProductContent(category, productName) {
    const contentMap = {
        // ── Eco Products ──
        'Bamboo': {
            description: `Our ${productName} is crafted from 100% sustainably grown bamboo — a fast-renewing, biodegradable resource that replaces harmful plastic alternatives.\n\n• Eco-friendly and fully compostable\n• Lightweight yet strong and durable\n• Anti-static properties for everyday use\n• Suitable for all ages and skin types`,
            howToUse: `1. Use gently with moderate pressure.\n2. Rinse with clean water after each use.\n3. Wipe dry with a soft cloth before storing.\n4. Replace every 6–12 months or when worn.`,
            coreInstructions: `Store in a cool, dry place away from direct sunlight.\nAvoid prolonged soaking in water — bamboo may crack.\nDo not use harsh chemical cleaners.\nCompost at the end of its life cycle.`,
        },
        'Coconut Shell': {
            description: `Our ${productName} is handcrafted from natural coconut shells by skilled artisans. Each piece is unique — no two items look exactly alike, making it a one-of-a-kind eco treasure.\n\n• 100% natural and upcycled material\n• Durable, food-grade safe finish\n• Lightweight and easy to handle\n• Supports local artisan communities`,
            howToUse: `1. Rinse with clean water before first use.\n2. Suitable for serving dry snacks, nuts, or decorative use.\n3. Wipe clean with a damp cloth after use.\n4. Do not use in microwave or dishwasher.`,
            coreInstructions: `Store in a dry place away from moisture.\nAvoid soaking in water for extended periods.\nWipe clean — do not submerge.\nOccasionally rub with coconut oil to maintain shine.`,
        },
        'Wood': {
            description: `Our ${productName} is made from premium natural wood, sustainably sourced and finished without harmful chemicals. Each piece is shaped and smoothed by hand, reflecting true artisan craftsmanship.\n\n• Chemical-free and food-safe\n• Naturally antimicrobial surface\n• Long-lasting and durable build\n• Biodegradable at end of life`,
            howToUse: `1. Wash gently with mild soap and warm water.\n2. Dry immediately — do not air dry or soak.\n3. Apply food-grade oil occasionally to prevent cracking.\n4. Use on flat surfaces to avoid tipping.`,
            coreInstructions: `Do not soak in water or put in dishwasher.\nDry thoroughly after each wash.\nStore away from direct sunlight and high heat.\nCondition with coconut or mineral oil every few months.`,
        },
        'Cotton': {
            description: `Our ${productName} is made from 100% organic cotton — grown without harmful pesticides and processed using eco-friendly methods. Soft, breathable, and built to last.\n\n• GOTS-certified organic cotton\n• Breathable and moisture-wicking\n• Gentle on sensitive skin\n• Shrink-resistant and durable`,
            howToUse: `1. Machine wash in cold water on gentle cycle.\n2. Use mild, eco-friendly detergent.\n3. Tumble dry on low or air dry flat.\n4. Iron on medium heat if needed.`,
            coreInstructions: `Wash with similar colours.\nAvoid bleach or harsh chemical detergents.\nDo not wring — gently squeeze out excess water.\nStore folded in a clean, dry space.`,
        },
        'Jute': {
            description: `Our ${productName} is crafted from 100% natural jute fibre — one of the strongest and most sustainable plant-based materials available. Tough, stylish, and planet-friendly.\n\n• Biodegradable and compostable\n• Strong, tightly woven construction\n• Naturally textured for a rustic look\n• Supports eco-conscious living`,
            howToUse: `1. Spot clean with a damp cloth.\n2. Allow to air dry completely after cleaning.\n3. Store in a cool, dry place when not in use.\n4. Avoid overfilling to maintain shape.`,
            coreInstructions: `Do not machine wash or submerge in water.\nKeep away from moisture to avoid mould.\nStore flat or hanging — avoid folding sharp creases.\nCompost at end of product life.`,
        },
        // ── Food Products ──
        'Nuts': {
            description: `Our ${productName} are carefully handpicked and sourced from the finest natural farms. Packed with healthy fats, protein, and essential minerals for a nutritious everyday snack.\n\n• Rich in Omega-3 and healthy fats\n• High in protein and dietary fibre\n• No artificial flavours or preservatives\n• Freshly sealed to lock in flavour`,
            howToUse: `1. Enjoy as a snack straight from the pack.\n2. Add to salads, smoothies, or trail mixes.\n3. Use in baking or cooking for added nutrition.\n4. Soak overnight for improved digestibility.`,
            coreInstructions: `Store in a cool, dry place in an airtight container.\nConsume within the best-before date printed on pack.\nRefrigerate after opening for extended freshness.\nKeep away from moisture and direct sunlight.`,
        },
        'Fresh Produce': {
            description: `Our ${productName} are sourced directly from trusted local farms and delivered fresh to ensure maximum nutritional value. Grown naturally without harmful chemicals or pesticides.\n\n• Farm-to-table freshness guaranteed\n• Rich in vitamins, minerals, and antioxidants\n• No chemical sprays or artificial ripening\n• Supports local farming communities`,
            howToUse: `1. Wash thoroughly under running water before use.\n2. Peel or slice as required for your recipe.\n3. Consume fresh for best taste and nutrition.\n4. Store in refrigerator to extend shelf life.`,
            coreInstructions: `Refrigerate immediately upon delivery.\nConsume within 3–5 days of purchase.\nWash only before eating — not before storing.\nKeep away from strong-smelling foods in the fridge.`,
        },
        'Oils': {
            description: `Our ${productName} is cold-pressed to preserve all the natural nutrients, antioxidants, and rich flavour of the raw ingredient. Pure, unrefined, and chemical-free.\n\n• First cold-press for maximum purity\n• Rich in antioxidants and healthy fatty acids\n• No additives, preservatives, or artificial colour\n• Suitable for cooking, skin, and hair care`,
            howToUse: `1. Use for cooking, stir-frying, or as a finishing oil.\n2. Apply on skin or hair as a moisturiser or conditioner.\n3. Use at low-to-medium heat to retain nutrients.\n4. Shake well before each use.`,
            coreInstructions: `Store in a cool, dark place away from sunlight.\nRefrigerate after opening — may solidify in cold, which is normal.\nConsume within 6 months of opening.\nKeep the bottle tightly sealed when not in use.`,
        },
        'Honey': {
            description: `Our ${productName} is raw, unprocessed honey collected directly from wild forest hives. It retains all natural enzymes, pollen, and antioxidants that are lost in commercial heating processes.\n\n• 100% raw and unfiltered\n• Packed with natural enzymes and antioxidants\n• No added sugar, colour, or preservatives\n• Supports immunity and overall wellness`,
            howToUse: `1. Take 1–2 teaspoons daily, alone or in warm water with lemon.\n2. Use as a natural sweetener in teas, smoothies, or desserts.\n3. Apply topically for skin healing or hair masks.\n4. Do not heat above 40°C — this destroys nutrients.`,
            coreInstructions: `Store at room temperature — do not refrigerate.\nKeep the lid tightly closed to prevent moisture absorption.\nCrystallisation is natural — gently warm in a water bath to re-liquefy.\nNot suitable for children under 1 year of age.`,
        },
        'Spices': {
            description: `Our ${productName} is ethically sourced and traditionally processed to preserve full flavour and potency. Free from artificial colours, additives, and adulterants.\n\n• Stone-ground for authentic flavour\n• Rich in natural phytonutrients\n• Anti-inflammatory and antioxidant properties\n• No artificial colour or chemical processing`,
            howToUse: `1. Add to curries, soups, or marinades for rich flavour.\n2. Bloom in hot oil to release maximum aroma.\n3. Use in spice rubs for meats or vegetables.\n4. Add a pinch to warm milk for health benefits.`,
            coreInstructions: `Store in an airtight glass container away from sunlight.\nKeep away from moisture and steam (e.g., near the stove).\nUse a dry spoon to scoop — avoid moisture contact.\nConsume within 12 months for best flavour.`,
        },
        'Grains': {
            description: `Our ${productName} is organically grown and traditionally milled, preserving full nutritional value including fibre, protein, and essential minerals. A wholesome addition to your daily diet.\n\n• Organically cultivated — no chemicals\n• High in dietary fibre and plant protein\n• Stone-milled for maximum nutrition\n• Gluten-free options available`,
            howToUse: `1. Rinse thoroughly before cooking.\n2. Cook with 2–3 parts water to 1 part grain.\n3. Use in porridge, rotis, baking, or salads.\n4. Soak overnight for faster cooking and better digestibility.`,
            coreInstructions: `Store in an airtight container in a cool, dry place.\nKeep away from moisture to prevent spoilage.\nConsume within 6 months of purchase.\nRefrigerate if opened in humid conditions.`,
        },
        // ── Wellness Products ──
        'Aromatherapy': {
            description: `Our ${productName} is crafted using 100% pure essential oils and natural waxes. Designed to transform your space into a sanctuary of calm and relaxation — free from synthetic fragrances.\n\n• Pure essential oil blend\n• Long-lasting, slow burn formula\n• No synthetic fragrance or paraffin\n• Promotes relaxation, focus, and mood uplift`,
            howToUse: `1. Place on a stable, heat-resistant surface.\n2. Light the wick and allow the scent to diffuse naturally.\n3. Burn for 2–4 hours at a time for best results.\n4. Extinguish fully before leaving the room.`,
            coreInstructions: `Keep away from children, pets, and flammable materials.\nNever leave a burning candle unattended.\nStore in a cool, dry place away from sunlight.\nTrim wick to 5mm before each use for a clean flame.`,
        },
        'Supplements & Teas': {
            description: `Our ${productName} is crafted using traditional Ayurvedic recipes with pure herbal ingredients. Designed to support your body's natural wellness and vitality every day.\n\n• Traditional Ayurvedic formula\n• No artificial flavours or preservatives\n• Caffeine-free options available\n• Rich in antioxidants and health-boosting compounds`,
            howToUse: `1. Steep 1 teaspoon in 200ml hot water for 5–7 minutes.\n2. Strain and enjoy plain or with honey and lemon.\n3. Consume 1–2 cups daily for best results.\n4. Consult a healthcare professional if pregnant or on medication.`,
            coreInstructions: `Store in an airtight container away from sunlight and moisture.\nKeep away from children.\nConsume within 12 months of purchase.\nNot a substitute for medical treatment.`,
        },
        'Massage Tools': {
            description: `Our ${productName} is ergonomically designed to relieve muscle tension, improve circulation, and promote overall body wellness. Made from premium, body-safe materials.\n\n• Targets sore muscles and pressure points\n• Improves blood circulation naturally\n• Easy to use on any part of the body\n• Lightweight and travel-friendly`,
            howToUse: `1. Apply gentle pressure on sore or tense muscles.\n2. Roll or glide in circular motions for 5–10 minutes.\n3. Use with a massage oil for enhanced effect.\n4. Clean with a damp cloth after each use.`,
            coreInstructions: `Store in a clean, dry place.\nWipe down with a damp cloth after each use.\nDo not apply excessive pressure on bones or joints.\nConsult a doctor if you have any injuries or conditions.`,
        },
        'Yoga & Meditation': {
            description: `Our ${productName} is made from eco-friendly, non-toxic materials that support your practice and the planet. Designed for stability, comfort, and mindful living.\n\n• Eco-friendly, non-toxic material\n• Non-slip surface for safe practice\n• Lightweight and portable\n• Supports posture, balance, and focus`,
            howToUse: `1. Unroll on a flat, dry surface before use.\n2. Use barefoot for maximum grip and stability.\n3. Clean with a damp cloth and mild soap after each session.\n4. Roll loosely and store upright or flat.`,
            coreInstructions: `Store rolled up in a dry, cool place.\nAvoid exposure to direct sunlight for extended periods.\nDo not fold — rolling preserves the material.\nAllow to air dry fully before rolling up after cleaning.`,
        },
        'Skincare & Bath': {
            description: `Our ${productName} is formulated with pure plant-based ingredients, free from harmful chemicals and synthetic additives. Gentle enough for daily use and all skin types.\n\n• Plant-based, vegan formula\n• Free from parabens, sulphates, and artificial fragrance\n• Deeply nourishes and hydrates skin\n• Dermatologist-tested and safe for sensitive skin`,
            howToUse: `1. Apply a small amount onto clean skin.\n2. Massage in gentle circular motions until absorbed.\n3. Use morning and night for best results.\n4. Avoid contact with eyes — rinse with water if needed.`,
            coreInstructions: `Store in a cool, dry place away from direct sunlight.\nKeep the lid tightly closed after each use.\nPatch test before first use on sensitive skin.\nDiscard if you notice any change in colour or smell.`,
        },
        // ── Craft Products ──
        'Pottery': {
            description: `Our ${productName} is hand-shaped by skilled potters using natural terracotta clay and fired in traditional kilns. Each piece carries the soul of the artisan who made it.\n\n• 100% natural terracotta clay\n• Kiln-fired for lasting durability\n• Unique — no two pieces are identical\n• Supports traditional pottery craft`,
            howToUse: `1. Soak in water for 30 minutes before first use.\n2. Wash gently with mild soap and a soft sponge.\n3. Use for planting, serving dry items, or décor.\n4. Dry thoroughly before storing.`,
            coreInstructions: `Do not use in microwave or dishwasher.\nHandle with care — terracotta is breakable.\nSeason new clay pots before first use.\nStore in a dry place to avoid mould.`,
        },
        'Paper Crafts': {
            description: `Our ${productName} is handmade from recycled and eco-friendly paper, crafted with care by local artisans. A sustainable, beautiful alternative to mass-produced stationery and packaging.\n\n• Made from 100% recycled/handmade paper\n• Biodegradable and compostable\n• Each piece is unique and handcrafted\n• Supports eco-conscious living`,
            howToUse: `1. Handle with dry hands to maintain quality.\n2. Use for gifting, journaling, or decorative purposes.\n3. Keep away from water and humidity.\n4. Recycle or compost at end of life.`,
            coreInstructions: `Store in a dry place away from moisture and sunlight.\nDo not expose to rain or excessive humidity.\nAvoid storing under heavy objects.\nRecycle responsibly.`,
        },
        'Metal Art': {
            description: `Our ${productName} is crafted by skilled metal artisans using premium-grade metal, shaped and finished by hand. Built for lasting beauty and durability.\n\n• Premium-quality, corrosion-resistant metal\n• Hand-hammered and hand-finished by artisans\n• Unique surface texture — no two pieces alike\n• Ideal for daily use or display`,
            howToUse: `1. Rinse with water and dry immediately after use.\n2. Polish occasionally with a dry soft cloth to maintain shine.\n3. Use for storage, serving, or decorative display.\n4. Avoid acidic foods in copper/brass items for extended periods.`,
            coreInstructions: `Dry thoroughly after washing to prevent tarnish.\nDo not use abrasive scrubbers or harsh chemicals.\nStore in a dry place — use a soft cloth cover to prevent scratches.\nPolish with lemon juice and salt naturally to restore shine.`,
        },
        'Woodwork': {
            description: `Our ${productName} is handcrafted from sustainably sourced solid wood, finished without harmful chemicals. Each item showcases the natural grain and warmth of real wood.\n\n• Sustainably sourced solid wood\n• Hand-carved and sanded to a smooth finish\n• Natural grain pattern — unique every time\n• Chemical-free and food-safe finish`,
            howToUse: `1. Wash gently with mild soap and a soft cloth.\n2. Dry immediately — do not air dry or soak.\n3. Use on flat, stable surfaces.\n4. Oil periodically to prevent drying and cracking.`,
            coreInstructions: `Do not soak in water or place in dishwasher.\nOil with food-grade coconut or linseed oil every few months.\nStore away from direct heat and sunlight.\nRepair small cracks with food-safe wood glue.`,
        },
        'Weaving': {
            description: `Our ${productName} is handwoven on traditional looms by skilled weavers who have passed this craft through generations. Made from natural fibres with no synthetic blends.\n\n• Handwoven on traditional handlooms\n• Natural cotton or jute fibres\n• Intricate patterns rooted in cultural heritage\n• Durable, tight weave for everyday use`,
            howToUse: `1. Wash in cold water on a gentle cycle.\n2. Use mild detergent — no bleach.\n3. Air dry flat to maintain shape.\n4. Iron on medium heat if needed.`,
            coreInstructions: `Wash separately for first few washes to prevent colour bleed.\nDo not tumble dry at high heat.\nStore folded in a clean, dry place.\nIron reverse-side to protect the weave pattern.`,
        },
        // ── Decor Products ──
        'Wall Art': {
            description: `Our ${productName} is a handcrafted statement piece for your home, made by skilled artisans using natural and sustainable materials. Each piece adds cultural depth and artistic beauty to any space.\n\n• Handcrafted by skilled artisans\n• Made from sustainable natural materials\n• Unique design — no two pieces are identical\n• Suitable for all interior styles`,
            howToUse: `1. Clean the wall surface before mounting.\n2. Use the included hooks or appropriate wall anchors.\n3. Hang at eye level for best visual impact.\n4. Dust occasionally with a soft, dry cloth.`,
            coreInstructions: `Do not expose to direct rain or high humidity.\nDust regularly with a dry, soft cloth.\nAvoid hanging in areas with excessive sunlight — may fade.\nHandle with care — fragile finishes may chip.`,
        },
        'Lighting': {
            description: `Our ${productName} creates a warm, inviting ambience using natural materials like bamboo or coconut shell. Handcrafted by artisans, each lamp is a unique piece of functional art.\n\n• Natural bamboo or coconut shell shade\n• Warm, diffused light for a cosy atmosphere\n• Handcrafted — each piece is unique\n• Uses standard bulb fittings`,
            howToUse: `1. Connect to a compatible power source.\n2. Use LED bulbs for energy efficiency and low heat.\n3. Allow adequate airflow around the shade.\n4. Switch off when not in use or unattended.`,
            coreInstructions: `Keep away from flammable materials.\nDo not exceed the recommended wattage.\nDust the shade with a soft, dry cloth only.\nDo not use in outdoor or high-humidity areas.`,
        },
        'Vases & Planters': {
            description: `Our ${productName} is crafted from natural, sustainable materials and designed to complement both plants and your interior décor. Perfect for indoor greenery and floral arrangements.\n\n• Made from natural eco-friendly materials\n• Suitable for indoor plants and flowers\n• Elegant design for any room\n• Durable and long-lasting`,
            howToUse: `1. Add a layer of pebbles at the bottom for drainage.\n2. Fill with potting mix and plant your choice of greenery.\n3. Water moderately and ensure proper drainage.\n4. Place in indirect sunlight for most indoor plants.`,
            coreInstructions: `Use a saucer under the planter to catch water overflow.\nWipe the exterior clean with a dry cloth.\nDo not submerge in water.\nHandle with care to avoid chipping or cracking.`,
        },
        'Table Accents': {
            description: `Our ${productName} is a handcrafted decorative accent designed to add elegance and artisan character to your dining or living space. Made with sustainable materials and expert craftsmanship.\n\n• Handmade by skilled artisans\n• Made from natural, sustainable materials\n• Adds warmth and elegance to any table\n• Easy to clean and maintain`,
            howToUse: `1. Place on a flat, stable surface.\n2. Use as a centrepiece, candle holder, or decorative piece.\n3. Dust regularly with a soft, dry cloth.\n4. Wipe with a slightly damp cloth for deeper cleaning.`,
            coreInstructions: `Keep away from excessive moisture and direct sunlight.\nHandle with care — some finishes may chip if dropped.\nDo not place hot items directly on the surface.\nClean only with dry or slightly damp cloth.`,
        },
        'Rugs & Carpets': {
            description: `Our ${productName} is handwoven from natural cotton or jute fibres using traditional techniques. It brings warmth, texture, and eco-conscious beauty to any room in your home.\n\n• Handwoven from natural cotton or jute\n• Non-slip backing for safety\n• Rich traditional patterns and colours\n• Durable for high-traffic areas`,
            howToUse: `1. Lay flat on a clean, dry floor.\n2. Use a non-slip rug pad for extra safety.\n3. Shake or vacuum regularly to remove dust.\n4. Spot clean with a damp cloth and mild soap.`,
            coreInstructions: `Do not machine wash — dry clean or spot clean only.\nAir dry completely if wet — do not fold when damp.\nRotate periodically for even wear.\nStore rolled, not folded, to avoid permanent creases.`,
        },
        // ── Fashion Products ──
        'Handmade Jewelry': {
            description: `Our ${productName} is handcrafted by local artisans using natural and eco-friendly materials. Every piece is unique, wearable art that tells a story of craft and culture.\n\n• Handcrafted — each piece is one of a kind\n• Made from natural, skin-safe materials\n• Lightweight and comfortable to wear\n• Supports local artisan livelihoods`,
            howToUse: `1. Wear with light outfits to let the piece stand out.\n2. Avoid contact with water, perfume, and lotions.\n3. Remove before bathing, swimming, or exercising.\n4. Store separately to avoid scratching.`,
            coreInstructions: `Store in a soft pouch or jewellery box.\nKeep away from moisture and harsh chemicals.\nClean gently with a dry, soft cloth.\nAvoid exposure to perfume directly on the piece.`,
        },
        'Cotton Apparel': {
            description: `Our ${productName} is made from 100% GOTS-certified organic cotton, free from harmful dyes and pesticides. Comfortable, breathable, and designed for everyday conscious wear.\n\n• Certified organic cotton\n• Breathable and moisture-wicking fabric\n• Gentle on sensitive skin\n• Eco-friendly dyeing process`,
            howToUse: `1. Machine wash in cold water on a gentle cycle.\n2. Use mild, eco-friendly detergent.\n3. Tumble dry on low or line dry.\n4. Iron on medium heat if needed.`,
            coreInstructions: `Wash with similar colours for first few washes.\nAvoid bleach and fabric softeners.\nDo not wring — gently squeeze excess water.\nStore folded in a clean, dry place.`,
        },
        'Handloom Sarees': {
            description: `Our ${productName} is handwoven by master weavers on traditional handlooms, keeping age-old weaving traditions alive. Made from pure natural fibres with vibrant natural dyes.\n\n• Handwoven by master weavers\n• Pure natural cotton or silk fibre\n• Vibrant colours from natural or AZO-free dyes\n• Supports India's living weaving heritage`,
            howToUse: `1. Dry clean recommended for best results.\n2. If hand washing, use cold water and mild detergent.\n3. Do not wring — gently press to remove excess water.\n4. Dry in shade — not in direct sunlight.`,
            coreInstructions: `Dry clean or hand wash only — no machine wash.\nStore wrapped in a soft muslin cloth.\nAvoid folding on the same lines repeatedly.\nKeep away from damp or humid storage areas.`,
        },
        'Eco Bags': {
            description: `Our ${productName} is crafted from natural jute or cotton — a durable, biodegradable alternative to plastic shopping bags. Stylish, spacious, and built for everyday use.\n\n• 100% natural jute or cotton\n• Sturdy, reinforced handles\n• Biodegradable and compostable\n• Reduces single-use plastic waste`,
            howToUse: `1. Use for grocery shopping, errands, or beach trips.\n2. Spot clean with a damp cloth for light stains.\n3. Air dry completely before storing.\n4. Avoid overloading beyond the recommended weight.`,
            coreInstructions: `Do not machine wash — spot clean only.\nAir dry fully after cleaning.\nStore in a dry place away from moisture.\nCompost at end of product life.`,
        },
        'Linen Wear': {
            description: `Our ${productName} is made from premium natural linen — one of the world's oldest and most sustainable fabrics. Breathable, durable, and effortlessly stylish.\n\n• Flax-based, certified natural linen\n• Highly breathable and thermoregulating\n• Gets softer and better with every wash\n• Eco-friendly production process`,
            howToUse: `1. Machine wash in cold or lukewarm water.\n2. Use mild detergent — no bleach.\n3. Line dry or tumble dry on low.\n4. Iron while slightly damp for a crisp look.`,
            coreInstructions: `Do not use hot water — linen may shrink.\nIron while slightly damp for best results.\nStore folded neatly in a cool, dry place.\nAvoid storing in plastic bags — linen needs to breathe.`,
        },
        // ── Legacy ──
        'Eco-Craft': {
            description: `Our ${productName} is made from 100% natural, eco-friendly materials and handcrafted by skilled artisans. A sustainable, thoughtful alternative to mass-produced products.\n\n• 100% natural and organic materials\n• Handcrafted with artisan skill\n• Biodegradable and eco-conscious\n• Supports local craft communities`,
            howToUse: `1. Use gently and with care.\n2. Clean with a soft, damp cloth.\n3. Dry thoroughly after cleaning.\n4. Store in a cool, dry place when not in use.`,
            coreInstructions: `Keep away from excessive moisture and heat.\nHandle with care to avoid damage.\nStore in a dry, cool place.\nDispose responsibly — compost if biodegradable.`,
        },
    };
    // Return category-specific content or a sensible default
    return contentMap[category] ?? {
        description: `Our ${productName} is carefully crafted using the finest natural materials, designed to bring quality and sustainability into your everyday life.\n\n• Premium natural materials\n• Handcrafted with artisan skill\n• Eco-friendly and sustainable\n• Built for quality and longevity`,
        howToUse: `1. Use gently as per its intended purpose.\n2. Clean with a soft, damp cloth after use.\n3. Dry completely before storing.\n4. Handle with care for long-lasting use.`,
        coreInstructions: `Store in a cool, dry place away from moisture and sunlight.\nClean gently — avoid harsh chemicals.\nHandle with care to prevent damage.\nDispose of responsibly at end of life.`,
    };
}
function getProductHighlights(category) {
    const iconClass = 'w-6 h-6';
    const highlightMap = {
        // Eco Products
        'Bamboo': [
            { icon: <Leaf className={iconClass}/>, title: '100% Natural Bamboo', desc: 'Made from sustainably grown bamboo' },
            { icon: <Recycle className={iconClass}/>, title: 'Biodegradable', desc: 'Fully compostable at end of life' },
            { icon: <Sparkles className={iconClass}/>, title: 'Anti-static', desc: 'Reduces frizz and static naturally' },
            { icon: <Sprout className={iconClass}/>, title: 'Eco-Friendly', desc: 'Zero plastic, zero chemicals' },
        ],
        'Coconut Shell': [
            { icon: <Leaf className={iconClass}/>, title: 'Natural Coconut Shell', desc: 'Handcrafted from real coconut shells' },
            { icon: <Recycle className={iconClass}/>, title: 'Upcycled Material', desc: 'Reduces agricultural waste' },
            { icon: <Gem className={iconClass}/>, title: 'Unique Finish', desc: 'Each piece has a one-of-a-kind pattern' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Durable & Safe', desc: 'Food-grade safe, long-lasting' },
        ],
        'Wood': [
            { icon: <Leaf className={iconClass}/>, title: 'Natural Wood', desc: 'Sourced from sustainable forests' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Chemical-Free', desc: 'No harmful coatings or varnishes' },
            { icon: <Gem className={iconClass}/>, title: 'Handcrafted', desc: 'Skillfully made by artisans' },
            { icon: <Recycle className={iconClass}/>, title: 'Biodegradable', desc: 'Fully eco-friendly product' },
        ],
        'Cotton': [
            { icon: <Leaf className={iconClass}/>, title: 'Organic Cotton', desc: 'Grown without harmful pesticides' },
            { icon: <Wind className={iconClass}/>, title: 'Breathable', desc: 'Soft, lightweight, and airy' },
            { icon: <Droplets className={iconClass}/>, title: 'Moisture-Wicking', desc: 'Keeps you cool and comfortable' },
            { icon: <Recycle className={iconClass}/>, title: 'Sustainable', desc: 'Eco-conscious production process' },
        ],
        'Jute': [
            { icon: <Leaf className={iconClass}/>, title: '100% Natural Jute', desc: 'Plant-based, biodegradable fibre' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Sturdy & Durable', desc: 'Strong weave for everyday use' },
            { icon: <Recycle className={iconClass}/>, title: 'Eco-Friendly', desc: 'Biodegradable and compostable' },
            { icon: <Sprout className={iconClass}/>, title: 'Low Carbon Footprint', desc: 'Minimal processing, natural growth' },
        ],
        // Food Products
        'Nuts': [
            { icon: <ShieldCheck className={iconClass}/>, title: 'Premium Quality', desc: 'Carefully sourced and handpicked' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Rich in Nutrients', desc: 'Packed with healthy fats & protein' },
            { icon: <Leaf className={iconClass}/>, title: 'Naturally Grown', desc: 'Free from artificial additives' },
            { icon: <Package className={iconClass}/>, title: 'Freshly Packed', desc: 'Sealed for maximum freshness' },
        ],
        'Fresh Produce': [
            { icon: <Sprout className={iconClass}/>, title: 'Farm Fresh', desc: 'Directly sourced from local farms' },
            { icon: <Leaf className={iconClass}/>, title: 'Naturally Grown', desc: 'No harmful pesticides used' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Nutrient-Rich', desc: 'High in vitamins and minerals' },
            { icon: <Droplets className={iconClass}/>, title: 'Hydrating', desc: 'High water content for wellness' },
        ],
        'Oils': [
            { icon: <Droplets className={iconClass}/>, title: 'Cold Pressed', desc: 'Retains natural nutrients & flavour' },
            { icon: <Leaf className={iconClass}/>, title: '100% Pure', desc: 'No additives or preservatives' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Heart Healthy', desc: 'Rich in good fats and antioxidants' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Lab Tested', desc: 'Quality assured and certified' },
        ],
        'Honey': [
            { icon: <Flower2 className={iconClass}/>, title: 'Raw Forest Honey', desc: 'Collected from wild forest flowers' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Unprocessed', desc: 'No heating or filtering applied' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Immunity Boosting', desc: 'Rich in antioxidants and enzymes' },
            { icon: <Leaf className={iconClass}/>, title: '100% Natural', desc: 'Zero additives or artificial sugar' },
        ],
        'Spices': [
            { icon: <Flame className={iconClass}/>, title: 'Authentic Flavour', desc: 'Stone-ground for full potency' },
            { icon: <Leaf className={iconClass}/>, title: 'Naturally Sourced', desc: 'Ethically farmed, pure spices' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Health Benefits', desc: 'Anti-inflammatory and antioxidant' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'No Adulteration', desc: 'Quality tested and certified pure' },
        ],
        'Grains': [
            { icon: <Sprout className={iconClass}/>, title: 'Organic Grains', desc: 'Naturally grown without chemicals' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Nutrient-Dense', desc: 'High fibre, protein and minerals' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Traditionally Milled', desc: 'Stone-ground for maximum nutrition' },
            { icon: <Leaf className={iconClass}/>, title: 'Chemical-Free', desc: 'No artificial preservatives added' },
        ],
        // Wellness Products
        'Aromatherapy': [
            { icon: <Wind className={iconClass}/>, title: 'Pure Essential Oils', desc: 'Natural aromas for mind & body' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Stress Relieving', desc: 'Calms nerves and uplifts mood' },
            { icon: <Leaf className={iconClass}/>, title: '100% Natural', desc: 'No synthetic fragrances or dyes' },
            { icon: <Sparkles className={iconClass}/>, title: 'Long Lasting', desc: 'Hours of soothing fragrance' },
        ],
        'Supplements & Teas': [
            { icon: <HeartPulse className={iconClass}/>, title: 'Health Boosting', desc: 'Formulated for wellness and vitality' },
            { icon: <Leaf className={iconClass}/>, title: 'Herbal Ingredients', desc: 'Traditional Ayurvedic recipes' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Clinically Safe', desc: 'No harmful additives' },
            { icon: <Coffee className={iconClass}/>, title: 'Rich Taste', desc: 'Delicious and nourishing blend' },
        ],
        'Massage Tools': [
            { icon: <HeartPulse className={iconClass}/>, title: 'Muscle Relief', desc: 'Soothes tension and soreness' },
            { icon: <Zap className={iconClass}/>, title: 'Improves Circulation', desc: 'Promotes blood flow naturally' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Safe Material', desc: 'Non-toxic, body-safe material' },
            { icon: <Sparkles className={iconClass}/>, title: 'Easy to Use', desc: 'Ergonomic design for comfort' },
        ],
        'Yoga & Meditation': [
            { icon: <Sprout className={iconClass}/>, title: 'Natural Material', desc: 'Eco-friendly and non-toxic' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Supports Wellness', desc: 'Enhances posture and focus' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Non-Slip Surface', desc: 'Safe and stable grip' },
            { icon: <Wind className={iconClass}/>, title: 'Lightweight', desc: 'Easy to carry and store' },
        ],
        'Skincare & Bath': [
            { icon: <Droplets className={iconClass}/>, title: 'Deeply Hydrating', desc: 'Nourishes and moisturises skin' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Ingredients', desc: 'Plant-based, skin-friendly formula' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Dermatologist Tested', desc: 'Safe for all skin types' },
            { icon: <Sparkles className={iconClass}/>, title: 'Radiant Glow', desc: 'Brightens and revitalises skin' },
        ],
        // Craft Products
        'Pottery': [
            { icon: <Palette className={iconClass}/>, title: 'Handcrafted Art', desc: 'Shaped by skilled artisan hands' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Clay', desc: 'Made from pure terracotta clay' },
            { icon: <Gem className={iconClass}/>, title: 'Unique Design', desc: 'No two pieces are exactly alike' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Durable & Safe', desc: 'Kiln-fired for lasting strength' },
        ],
        'Paper Crafts': [
            { icon: <Recycle className={iconClass}/>, title: 'Recycled Paper', desc: 'Crafted from eco-friendly paper' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handmade', desc: 'Each piece made with care' },
            { icon: <Leaf className={iconClass}/>, title: 'Sustainable', desc: 'Biodegradable and eco-conscious' },
            { icon: <Palette className={iconClass}/>, title: 'Artistic Design', desc: 'Beautifully crafted and decorative' },
        ],
        'Metal Art': [
            { icon: <ShieldCheck className={iconClass}/>, title: 'Premium Metal', desc: 'High-quality, corrosion-resistant' },
            { icon: <Gem className={iconClass}/>, title: 'Handcrafted', desc: 'Precision artisan workmanship' },
            { icon: <Award className={iconClass}/>, title: 'Long-Lasting', desc: 'Built to last for years' },
            { icon: <Palette className={iconClass}/>, title: 'Stunning Finish', desc: 'Beautifully polished and detailed' },
        ],
        'Woodwork': [
            { icon: <Leaf className={iconClass}/>, title: 'Natural Wood', desc: 'Sustainably sourced timber' },
            { icon: <HandHeart className={iconClass}/>, title: 'Hand-Finished', desc: 'Smoothed and crafted by artisans' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Durable Build', desc: 'Solid construction for daily use' },
            { icon: <Gem className={iconClass}/>, title: 'Unique Grain', desc: 'Natural wood pattern, one of a kind' },
        ],
        'Weaving': [
            { icon: <HandHeart className={iconClass}/>, title: 'Handwoven', desc: 'Crafted on traditional handlooms' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Fibres', desc: 'Made from cotton or jute fibres' },
            { icon: <Palette className={iconClass}/>, title: 'Artistic Patterns', desc: 'Intricate, cultural designs' },
            { icon: <Award className={iconClass}/>, title: 'Long-lasting Quality', desc: 'Tightly woven for durability' },
        ],
        // Decor Products
        'Wall Art': [
            { icon: <Palette className={iconClass}/>, title: 'Artistic Design', desc: 'Statement piece for any room' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handcrafted', desc: 'Made by skilled artisans' },
            { icon: <Gem className={iconClass}/>, title: 'Premium Finish', desc: 'Polished and beautifully detailed' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Easy to Mount', desc: 'Comes with mounting hardware' },
        ],
        'Lighting': [
            { icon: <Sun className={iconClass}/>, title: 'Warm Ambience', desc: 'Creates a cozy, inviting glow' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Material', desc: 'Eco-friendly bamboo or coconut shell' },
            { icon: <Gem className={iconClass}/>, title: 'Artistic Craft', desc: 'Handcrafted for unique beauty' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Safe Wiring', desc: 'Certified electrical components' },
        ],
        'Vases & Planters': [
            { icon: <Flower2 className={iconClass}/>, title: 'Perfect for Plants', desc: 'Ideal for indoor greenery' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Material', desc: 'Eco-conscious craftsmanship' },
            { icon: <Palette className={iconClass}/>, title: 'Elegant Design', desc: 'Adds beauty to any space' },
            { icon: <Droplets className={iconClass}/>, title: 'Moisture Retention', desc: 'Keeps plants healthy longer' },
        ],
        'Table Accents': [
            { icon: <Gem className={iconClass}/>, title: 'Premium Craft', desc: 'Adds elegance to your table' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handmade', desc: 'Crafted with artisan precision' },
            { icon: <Palette className={iconClass}/>, title: 'Stylish Design', desc: 'Modern meets traditional art' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Durable Finish', desc: 'Long-lasting, easy to clean' },
        ],
        'Rugs & Carpets': [
            { icon: <HandHeart className={iconClass}/>, title: 'Handwoven', desc: 'Crafted on traditional looms' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Fibre', desc: 'Cotton or jute, eco-friendly' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Non-Slip Base', desc: 'Safe and stable underfoot' },
            { icon: <Palette className={iconClass}/>, title: 'Rich Patterns', desc: 'Beautiful traditional designs' },
        ],
        // Fashion Products
        'Handmade Jewelry': [
            { icon: <Gem className={iconClass}/>, title: 'Unique Pieces', desc: 'One-of-a-kind artisan jewelry' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handcrafted', desc: 'Made by skilled local artisans' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Materials', desc: 'Eco-friendly and skin-safe' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Hypoallergenic', desc: 'Safe for sensitive skin' },
        ],
        'Cotton Apparel': [
            { icon: <Leaf className={iconClass}/>, title: 'Organic Cotton', desc: 'Grown pesticide-free' },
            { icon: <Wind className={iconClass}/>, title: 'Breathable Fabric', desc: 'Keeps you cool all day' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Skin-Friendly', desc: 'Gentle on sensitive skin' },
            { icon: <Recycle className={iconClass}/>, title: 'Sustainable Fashion', desc: 'Eco-conscious clothing choice' },
        ],
        'Handloom Sarees': [
            { icon: <HandHeart className={iconClass}/>, title: 'Handloom Woven', desc: 'Crafted on traditional handlooms' },
            { icon: <Gem className={iconClass}/>, title: 'Heritage Craft', desc: 'Keeps weaving traditions alive' },
            { icon: <Palette className={iconClass}/>, title: 'Vibrant Colours', desc: 'Natural dyes, rich hues' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Fibre', desc: 'Pure cotton or silk weave' },
        ],
        'Eco Bags': [
            { icon: <Leaf className={iconClass}/>, title: 'Eco-Friendly', desc: 'Reduces single-use plastic waste' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Sturdy & Durable', desc: 'Reinforced stitching for strength' },
            { icon: <Recycle className={iconClass}/>, title: 'Sustainable Material', desc: 'Made from natural jute or cotton' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handmade', desc: 'Crafted by local artisans' },
        ],
        'Linen Wear': [
            { icon: <Wind className={iconClass}/>, title: 'Ultra Breathable', desc: 'Linen stays cool in any weather' },
            { icon: <Leaf className={iconClass}/>, title: 'Natural Linen', desc: 'Flax-based, eco-friendly fabric' },
            { icon: <HeartPulse className={iconClass}/>, title: 'Hypoallergenic', desc: 'Perfect for sensitive skin' },
            { icon: <Award className={iconClass}/>, title: 'Gets Better With Age', desc: 'Softens and improves over time' },
        ],
        // Eco-Craft (legacy)
        'Eco-Craft': [
            { icon: <Leaf className={iconClass}/>, title: '100% Natural', desc: 'Made from natural, organic materials' },
            { icon: <Recycle className={iconClass}/>, title: 'Eco-Friendly', desc: 'Sustainable and biodegradable' },
            { icon: <HandHeart className={iconClass}/>, title: 'Handcrafted', desc: 'Made with artisan skill and care' },
            { icon: <ShieldCheck className={iconClass}/>, title: 'Safe & Durable', desc: 'Long-lasting quality product' },
        ],
    };
    // Return mapped highlights or a default set
    return highlightMap[category] ?? [
        { icon: <Leaf className={iconClass}/>, title: 'Natural & Pure', desc: 'Made from the finest natural materials' },
        { icon: <HandHeart className={iconClass}/>, title: 'Handcrafted', desc: 'Crafted with artisan skill and care' },
        { icon: <ShieldCheck className={iconClass}/>, title: 'Quality Assured', desc: 'Tested and certified for quality' },
        { icon: <Recycle className={iconClass}/>, title: 'Sustainable', desc: 'Eco-conscious and biodegradable' },
    ];
}
const mockReviews = [
    {
        id: 'r1',
        author: 'Priya M.',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        isVerified: true,
        content: "Quality is incredible — you can tell it's handmade with love. Packaging was completely plastic-free.",
    },
    {
        id: 'r2',
        author: 'Anu S.',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        isVerified: true,
        content: "Perfect for detangling wet hair. My kids love using it too. Great value for 4 brushes!",
    },
    {
        id: 'r3',
        author: 'Swati.R',
        avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
        isVerified: true,
        content: "Beautiful brush, but I wish the bristles were a bit softer. Still, amazing eco-friendly alternative!",
    },
];
export default function ProductDetailsPage() {
    const { id } = useParams();
    const { t } = useTranslation();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [productDetail, setProductDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [deliveryChecked, setDeliveryChecked] = useState(false);
    const fallbackContent = product ? getProductContent(product.category, product.name) : null;
    const tabDescription = productDetail?.full_description || fallbackContent?.description || '';
    const tabHowToUse = productDetail?.how_to_use || fallbackContent?.howToUse || '';
    const tabCoreInstructions = productDetail?.core_instructions || fallbackContent?.coreInstructions || '';
    const displayHighlights = Array.isArray(productDetail?.highlights) && productDetail.highlights.length > 0
        ? productDetail.highlights.map((highlight) => ({
            icon: <Leaf className="w-6 h-6"/>,
            title: highlight.title,
            desc: highlight.desc,
        }))
        : product
            ? getProductHighlights(product.category)
            : [];
    useEffect(() => {
        let mounted = true;
        setLoading(true);
        const load = async () => {
            try {
                const backendProduct = await getProductBySlug(id);
                const mapped = mapApiProductToProduct(backendProduct);
                const localProduct = allProducts.find((item) =>
                    item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === mapped.slug
                );
                const productWithImageFallback = mapped.image || !localProduct?.image
                    ? mapped
                    : {
                        ...mapped,
                        image: localProduct.image,
                        images: [localProduct.image],
                    };
                if (mounted) {
                    setProduct(productWithImageFallback);
                    const [details, relatedResponse] = await Promise.all([
                        getProductDetails(mapped.slug || mapped.id).catch((error) => {
                            console.warn('Product details API failed:', error);
                            return null;
                        }),
                        mapped.category_slug
                            ? getProductsByCategory(mapped.category_slug, { limit: 12 }).catch((error) => {
                                console.warn('Related products API failed:', error);
                                return { products: [] };
                            })
                            : Promise.resolve({ products: [] }),
                    ]);
                    if (!mounted)
                        return;
                    setProductDetail(details);
                    setSimilarProducts((relatedResponse.products || [])
                        .map((p) => mapApiProductToProduct(p))
                        .filter((p) => p.id !== mapped.id && p.slug !== mapped.slug)
                        .slice(0, 6));
                    const storedRecent = localStorage.getItem('recentlyViewed');
                    let recentList = storedRecent ? JSON.parse(storedRecent) : [];
                    recentList = recentList.filter((p) => p.id !== mapped.id);
                    const updatedRecent = [productWithImageFallback, ...recentList].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
                    setRecentlyViewed(recentList.slice(0, 6));
                }
            }
            catch (error) {
                console.warn('Backend unavailable:', error);
                if (mounted) {
                    setProduct(null);
                    setProductDetail(null);
                    setSimilarProducts([]);
                }
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [id]);
    const handleApplyPincode = () => {
        if (pincode.trim().length === 6 && /^\d{6}$/.test(pincode.trim())) {
            setDeliveryChecked(true);
        }
        else {
            setDeliveryChecked(false);
            alert('Please enter a valid 6-digit pincode.');
        }
    };
    const handleShare = async () => {
        if (!product)
            return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description || 'Check out this amazing product on VedaCraft!',
                    url: window.location.href,
                });
            }
            catch (error) {
                console.error('Error sharing', error);
            }
        }
        else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
            }
            catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };
    // Compute estimated delivery date (3 days from today)
    const deliveryDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    })();
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-gray-500 font-medium">Loading product...</p>
      </div>);
    }
    if (!product) {
        return (<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('product.notFound')}</h2>
          <p className="mb-4">{t('product.notFoundDesc')}</p>
          <Link to="/" className="text-green-600 hover:underline">
            {t('product.returnHome')}
          </Link>
        </div>
      </div>);
    }
    const productImages = product.images?.filter(Boolean) || [];
    const primaryImage = productImages[0] || product.image;
    return (<div className="bg-white min-h-screen pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8 whitespace-nowrap overflow-x-auto pb-2 scrollbar-hide">
          <Link to="/" className="hover:text-green-600">{t('product.returnHome').split(' ')[0]}</Link>
          <ChevronRight className="w-4 h-4 mx-2"/>
          <span className="hover:text-green-600 cursor-pointer">{t(`productsData.${product.category}`, product.category)}</span>
          <ChevronRight className="w-4 h-4 mx-2"/>
          <span className="text-gray-800 font-medium">{t(`productsData.${product.name}`, product.name)}</span>
        </nav>

        {/* Main Product Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          
          {/* Image Gallery */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-20 flex-shrink-0">
              {[1, 2, 3, 4].map((item) => (<div key={item} className="bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-green-500">
                   <img src={productImages[item - 1] || primaryImage} alt="thumbnail" className="w-full h-auto object-cover"/>
                </div>))}
            </div>
            <div className="flex-1 flex items-start justify-center relative group">
               <img src={primaryImage} alt={t(`productsData.${product.name}`, product.name)} className="w-full h-auto rounded-xl object-contain shadow-sm border border-gray-100"/>
               
               {/* Floating Action Group */}
               <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 <WishlistButton product={product}/>
                 <button onClick={handleShare} className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center transition-all duration-200 hover:scale-110 text-gray-400 hover:text-green-600" aria-label="Share product">
                   <Share2 className="w-4 h-4"/>
                 </button>
               </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t(`productsData.${product.name}`, product.name)}</h1>
            <p className="text-sm text-gray-500 mb-4">{t('product.biodegradable')}</p>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-green-700 text-white px-2 py-0.5 rounded text-sm font-medium">
                {product.rating} <Star className="w-3.5 h-3.5 fill-white ml-1"/>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400"/>))}
              </div>
              <span className="text-sm text-blue-600">(1,248 {t('product.reviews')})</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">&#8377; {product.price}</span>
              <span className="text-lg text-gray-400 line-through mb-1">&#8377; {Math.round(product.price * 1.5)}</span>
              <span className="text-sm text-green-600 font-semibold mb-1.5">50% {t('product.off')}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center border border-gray-300 rounded-md w-fit mb-8">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors">
                <Minus className="w-4 h-4"/>
              </button>
              <span className="px-4 py-1.5 border-x border-gray-300 font-medium text-gray-800 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1.5 hover:bg-gray-100 text-gray-600 transition-colors">
                <Plus className="w-4 h-4"/>
              </button>
            </div>

            {/* Size Recommendation for Fashion */}
            {product.category_slug === 'fashion' && ['Cotton Apparel', 'Linen Wear'].includes(product.category) && (<div className="mb-8 bg-[#fdf8f4] border border-[#f9eadf] rounded-xl p-4 flex items-start gap-4">
                <div className="bg-orange-100 p-2.5 rounded-full text-orange-600 flex-shrink-0">
                  <Shirt className="w-5 h-5"/>
                </div>
                <div>
                  <h4 className="font-bold text-orange-900 text-sm flex items-center gap-1.5">
                    ✨ Recommended Size: M
                  </h4>
                  <p className="text-orange-800/80 text-xs mt-1 leading-relaxed">
                    Based on your saved profile measurements, Size M fits you perfectly for this item.
                  </p>
                  <Link to="/profile/size-profile" className="text-orange-600 text-xs font-semibold mt-2 inline-block hover:underline">
                    Edit Measurements
                  </Link>
                </div>
              </div>)}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <button onClick={() => addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
            rating: product.rating
        })} className="bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-sm">
                {t('product.addToCart')}
              </button>
              <button onClick={() => {
            navigate('/checkout', {
                state: {
                    buyNowItem: {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: quantity,
                        rating: product.rating,
                    }
                }
            });
        }} className="bg-amber-400 hover:bg-amber-500 text-white font-semibold py-3 px-6 rounded-md transition-colors shadow-sm">
                {t('product.buyNow')}
              </button>
            </div>

            {/* Delivery Location */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t('product.deliveryLocation')}</h3>
              <p className="text-sm text-gray-600 mb-4">{t('product.deliveryLocationDesc')}</p>
              {/* Pincode Input Row */}
              <div className="flex">
                <input type="text" placeholder={t('product.enterPincode')} value={pincode} maxLength={6} onChange={(e) => {
            setPincode(e.target.value);
            if (deliveryChecked)
                setDeliveryChecked(false);
        }} onKeyDown={(e) => e.key === 'Enter' && handleApplyPincode()} className="border border-gray-300 rounded-l-md px-4 py-2.5 flex-1 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"/>
                <button onClick={handleApplyPincode} className="bg-gray-50 border border-l-0 border-gray-300 text-gray-700 font-medium px-6 py-2.5 rounded-r-md hover:bg-gray-100 transition-colors">
                  {t('product.apply')}
                </button>
              </div>

              {/* Flipkart-style Delivery Info — shown after pincode applied */}
              {deliveryChecked && (<div className="mt-4 border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                  {/* Option 1 — Free Delivery */}
                  <div className="flex items-start gap-3 px-4 py-3 bg-white">
                    <span className="mt-0.5 text-green-600 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="1"/>
                        <path d="M16 8h4l3 4v4h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Delivery by <span className="text-green-700">{deliveryDate}</span>
                        <span className="ml-2 text-green-600 font-bold">Free</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">If ordered before 4 PM today</p>
                    </div>
                  </div>

                  {/* Option 2 — Pay on Delivery */}
                  <div className="flex items-start gap-3 px-4 py-3 bg-white">
                    <span className="mt-0.5 text-blue-500 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Pay on Delivery <span className="text-blue-600 font-semibold">Available</span></p>
                      <p className="text-xs text-gray-500 mt-0.5">Cash / UPI on delivery for this pincode</p>
                    </div>
                  </div>
                </div>)}
            </div>

          </div>
        </div>

        {/* Product Highlights */}
        <div className="py-8 border-t border-gray-100 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{t('product.highlights')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayHighlights.map((highlight, index) => (<div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-100">
                <div className="bg-green-50 p-2 rounded-lg text-green-600 mt-0.5">
                  {highlight.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{t(`productsData.${product.category}.highlights.${index}.title`, highlight.title)}</h3>
                  <p className="text-sm text-gray-500">{t(`productsData.${product.category}.highlights.${index}.desc`, highlight.desc)}</p>
                </div>
              </div>))}
          </div>
        </div>

        {/* Tabs Section */}
        <ProductTabs description={t(`productsData.${product.category}.description`, tabDescription)} howToUse={t(`productsData.${product.category}.howToUse`, tabHowToUse)} coreInstructions={t(`productsData.${product.category}.coreInstructions`, tabCoreInstructions)}/>

        {/* Reviews Section */}
        <div className="mt-16 mb-16">
          <h2 className="text-lg font-bold text-gray-900 mb-6">{t('product.review')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockReviews.map((review) => (<ReviewCard key={review.id} review={review}/>))}
          </div>
        </div>

      </div>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (<div className="bg-white pt-8 pb-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <ProductSection title="Recently Viewed" products={recentlyViewed}/>
          </div>
        </div>)}

      {/* Similar Products */}
      {similarProducts.length > 0 && (<div className="bg-gray-50 pt-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <ProductSection title={t('product.similarProducts')} products={similarProducts}/>
          </div>
        </div>)}
    </div>);
}
