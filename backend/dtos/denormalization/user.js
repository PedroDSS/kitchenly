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
            "vatNumber",
            "roles"
        ]
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
        customerType: userJSON.customerType === 'B2C' ? 'individual' : 'professional',
        companyName: userJSON.companyName,
        siret: userJSON.vatNumber, // MongoDB model expects siret instead of vatNumber
        roles: userJSON.roles || [],
        addresses: [],
        emailAlerts: [],
        orders: []
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