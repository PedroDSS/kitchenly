const UserMongo = require("../../models/mongo/user");

module.exports = async function denormalizeUser(user, models) {
    const User = models.User;

    const userDenormalized = await User.findByPk(user.id, {
        attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "phone",
            "customerType",
            "companyName",
            "siret",
            "roles"
        ],
        include: [
            { 
                model: models.Address,
                attributes: ["id", "type", "street", "city", "postalCode", "country", "isDefault"],
                required: false
            },
            { 
                model: models.EmailAlert,
                attributes: ["id", "alertType", "productId", "createdAt"],
                required: false,
                include: [
                    {
                        model: models.Product,
                        attributes: ["id", "name"]
                    }
                ]
            },
            {
                model: models.Order,
                attributes: ["id", "orderNumber", "total", "status", "createdAt"],
                required: false,
                order: [["createdAt", "DESC"]],
                limit: 10
            }
        ],
    });

    if (!userDenormalized) {
        throw new Error(`User with id ${user.id} not found`);
    }

    const userJSON = userDenormalized.toJSON();
    
    const userMongoData = {
        userId: userJSON.id,
        email: userJSON.email,
        firstName: userJSON.firstName,
        lastName: userJSON.lastName,
        phone: userJSON.phone,
        customerType: userJSON.customerType,
        companyName: userJSON.companyName,
        siret: userJSON.siret,
        roles: userJSON.roles || [],
        addresses: userJSON.Addresses ? userJSON.Addresses.map(addr => ({
            type: addr.type,
            street: addr.street,
            city: addr.city,
            postalCode: addr.postalCode,
            country: addr.country,
            isDefault: addr.isDefault
        })) : [],
        emailAlerts: userJSON.EmailAlerts ? userJSON.EmailAlerts.map(alert => ({
            alertId: alert.id,
            productId: alert.productId,
            productName: alert.Product ? alert.Product.name : null,
            alertType: alert.alertType,
            createdAt: alert.createdAt
        })) : [],
        orders: userJSON.Orders ? userJSON.Orders.map(order => ({
            orderId: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
            createdAt: order.createdAt
        })) : []
    };

    const userMongo = await UserMongo.findOneAndUpdate(
        { userId: user.id },
        userMongoData,
        {
            upsert: true,
            new: true,
            runValidators: true
        }
    );

    return userMongo;
};