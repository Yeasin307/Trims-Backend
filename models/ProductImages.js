module.exports = (sequelize, DataTypes) => {

    const ProductImages = sequelize.define("ProductImages", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        productId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id',
            }
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        extension: {
            type: DataTypes.STRING(8),
            allowNull: false
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

    ProductImages.associate = (models) => {

        ProductImages.belongsTo(models.Products, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            foreignKey: {
                name: 'productId'
            }
        });

        ProductImages.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'createdByUser',
            foreignKey: {
                name: 'createdBy'
            }
        });

        ProductImages.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'updatedByUser',
            foreignKey: {
                name: 'updatedBy'
            }
        });
    };

    return ProductImages;
};