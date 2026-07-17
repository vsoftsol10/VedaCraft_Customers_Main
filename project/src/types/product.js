export const mapApiProductToProduct = (apiProduct) => {
    const images = Array.isArray(apiProduct.images) ? apiProduct.images : [];
    const firstImage = apiProduct.image || images[0] || '';
    const specs = apiProduct.specifications || {};
    return {
        id: apiProduct.id,
        name: apiProduct.name,
        slug: apiProduct.slug,
        description: apiProduct.description,
        category: apiProduct.category,
        brand: apiProduct.brand,
        price: apiProduct.price,
        discountPrice: apiProduct.discount_price,
        stock: apiProduct.stock,
        images,
        image: firstImage,
        rating: apiProduct.rating,
        totalReviews: apiProduct.total_reviews,
        specifications: specs,
        isFeatured: apiProduct.is_featured,
        createdAt: apiProduct.created_at,
        updatedAt: apiProduct.updated_at,
        section: apiProduct.section || specs.section || undefined,
        mainCategory: specs.mainCategory || apiProduct.category,
    };
};
export const mapLocalProductToProduct = (localProduct) => {
    return {
        id: localProduct.id,
        name: localProduct.name,
        slug: localProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: '',
        category: localProduct.category,
        brand: '',
        price: localProduct.price,
        discountPrice: null,
        stock: 0,
        images: [localProduct.image],
        image: localProduct.image,
        rating: localProduct.rating,
        totalReviews: 0,
        specifications: {},
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        section: localProduct.section,
        mainCategory: localProduct.category,
    };
};
