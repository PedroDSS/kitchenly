const ProductSearch = require("../../models/mongo/ProductSearch");

module.exports = async function denormalizeProduct(product, models) {
    const Product = models.Product;

    const productDenormalized = await Product.findByPk(product.id, {
        attributes: [
            "id",
            "name",
            "description",
            "price",
            "stock",
            "viewCount",
            "salesCount",
            "rating",
            "reviewCount",
            "sku",
            "features",
            "specifications",
            "weight",
            "dimensions",
            "isActive",
            "isFeatured",
            "isB2B",
            "minB2BQuantity",
            "b2bPrice"
        ],
        include: [
            { 
                model: models.Category, 
                attributes: ["id", "name", "slug", "level"],
            },
            { 
                model: models.Brand, 
                attributes: ["id", "name", "slug", "description"],
            },
            { 
                model: models.EmailAlert, 
                attributes: ["id"],
                required: false
            },
            {
                model: models.StockMovement,
                attributes: ["id"],
                required: false
            }
        ],
    });

    if (!productDenormalized) {
        throw new Error(`Product with id ${product.id} not found`);
    }

    const productJSON = productDenormalized.toJSON();
    
    // Build category path
    let categoryPath = [];
    if (productJSON.Category) {
        // TODO: Implement recursive category path building
        categoryPath = [productJSON.Category.name];
    }

    // Transform to MongoDB format
    const productSearchData = {
        productId: productJSON.id,
        name: productJSON.name,
        description: productJSON.description,
        brand: productJSON.Brand ? {
            id: productJSON.Brand.id,
            name: productJSON.Brand.name,
            slug: productJSON.Brand.slug
        } : null,
        category: productJSON.Category ? {
            id: productJSON.Category.id,
            name: productJSON.Category.name,
            slug: productJSON.Category.slug,
            path: categoryPath,
            level: productJSON.Category.level
        } : null,
        price: productJSON.price,
        stock: productJSON.stock,
        images: [], // TODO: Add image relations
        attributes: [],
        tags: [],
        rating: {
            average: productJSON.rating || 0,
            count: productJSON.reviewCount || 0
        },
        isActive: productJSON.isActive,
        isFeatured: productJSON.isFeatured,
        isNew: false, // TODO: Calculate based on createdAt
        discount: {
            percentage: null,
            validUntil: null
        },
        searchScore: 1,
        clickCount: productJSON.viewCount || 0,
        purchaseCount: productJSON.salesCount || 0,
        lastUpdated: new Date()
    };

    // Extract attributes from features and specifications
    if (productJSON.features) {
        productJSON.features.forEach(feature => {
            productSearchData.attributes.push({
                name: 'feature',
                value: feature,
                searchable: true
            });
        });
    }

    if (productJSON.specifications) {
        Object.entries(productJSON.specifications).forEach(([key, value]) => {
            productSearchData.attributes.push({
                name: key,
                value: value,
                searchable: true
            });
        });
    }

    // Add B2B tag if applicable
    if (productJSON.isB2B) {
        productSearchData.tags.push('b2b');
    }

    // Upsert to MongoDB
    const productMongo = await ProductSearch.findOneAndUpdate(
        { productId: product.id },
        productSearchData,
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    return productMongo;
};