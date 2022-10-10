module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        role_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
        },
        active: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0'
        },
        deleted: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0'
        }
    });

    Users.associate = (models) => {

        Users.hasMany(models.Categories,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'createdBy'
                }
            });

        Users.hasMany(models.Categories,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'updatedBy'
                }
            });

        Users.hasMany(models.Products,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'createdBy'
                }
            });

        Users.hasMany(models.Products,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'updatedBy'
                }
            });

        Users.hasMany(models.ProductImages,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'createdBy'
                }
            });

        Users.hasMany(models.ProductImages,
            {
                sourceKey: 'id',
                foreignKey: {
                    name: 'updatedBy'
                }
            });
    };

    return Users;
};