const CategoryMongo = require("../../models/mongo/category");

module.exports = async function denormalizeCategory(category, models) {
    const Category = models.Category;

    const categoryDenormalized = await Category.findByPk(category.id, {
        attributes: [
            "id",
            "name",
            "slug",
            "description",
            "parentId",
            "level",
            "isActive",
            "displayOrder"
        ],
        include: [
            { 
                model: models.Product,
                attributes: ["id"],
                required: false
            },
            {
                model: models.Category,
                as: 'children',
                attributes: ["id", "name", "slug"],
                required: false,
                include: [
                    {
                        model: models.Product,
                        attributes: ["id"],
                        required: false
                    }
                ]
            }
        ],
    });

    if (!categoryDenormalized) {
        throw new Error(`Category with id ${category.id} not found`);
    }

    const categoryJSON = categoryDenormalized.toJSON();
    
    // Build category path
    const path = await buildCategoryPath(category.id, models);
    
    const categoryMongoData = {
        categoryId: categoryJSON.id,
        name: categoryJSON.name,
        slug: categoryJSON.slug,
        description: categoryJSON.description,
        parentId: categoryJSON.parentId,
        level: categoryJSON.level,
        path: path,
        isActive: categoryJSON.isActive,
        displayOrder: categoryJSON.displayOrder,
        productCount: categoryJSON.Products ? categoryJSON.Products.length : 0,
        children: categoryJSON.children ? categoryJSON.children.map(child => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            productCount: child.Products ? child.Products.length : 0
        })) : []
    };

    const categoryMongo = await CategoryMongo.findOneAndUpdate(
        { categoryId: category.id },
        categoryMongoData,
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    return categoryMongo;
};

async function buildCategoryPath(categoryId, models) {
    const path = [];
    let currentId = categoryId;
    
    while (currentId) {
        const category = await models.Category.findByPk(currentId, {
            attributes: ["id", "name", "slug", "parentId"]
        });
        
        if (!category) break;
        
        path.unshift({
            id: category.id,
            name: category.name,
            slug: category.slug
        });
        
        currentId = category.parentId;
    }
    
    return path;
}