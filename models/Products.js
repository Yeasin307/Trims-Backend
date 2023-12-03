module.exports = (sequelize, DataTypes) => {

    const Products = sequelize.define("Products", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        productName: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'id',
            }
        },
        title: {
            type: DataTypes.TEXT('tiny'),
            allowNull: false
        },
        subTitle: {
            type: DataTypes.TEXT('tiny')
        },
        description: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        misc_1: {
            type: DataTypes.TEXT('long')
        },
        misc_2: {
            type: DataTypes.TEXT('long')
        },
        tags: {
            type: DataTypes.TEXT('long')
        },
        isFeatured: {
            type: DataTypes.ENUM('1', '0'),
            allowNull: false,
            defaultValue: '0'
        },
        active: {
            type: DataTypes.ENUM('1', '0'),
            allowNull: false,
            defaultValue: '1'
        },
        deleted: {
            type: DataTypes.ENUM('1', '0'),
            allowNull: false,
            defaultValue: '0'
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            }
        },
        updatedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            }
        }
    });

    Products.associate = (models) => {

        Products.hasMany(models.ProductImages,
            {
                as: 'productDetails',
                sourceKey: 'id',
                foreignKey: {
                    name: 'productId'
                }
            });

        Products.belongsTo(models.Categories, {
            as: 'categoryName',
            foreignKey: {
                name: 'categoryId'
            }
        });

        Products.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'createdByUser',
            foreignKey: {
                name: 'createdBy'
            }
        });

        Products.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'updatedByUser',
            foreignKey: {
                name: 'updatedBy'
            }
        });
    };

    return Products;
};