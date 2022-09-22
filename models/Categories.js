module.exports = (sequelize, DataTypes) => {

    const Categories = sequelize.define("Categories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        parentId: {
            type: DataTypes.STRING(36),
            defaultValue: null,
            references: {
                model: 'Categories',
                key: 'id',
            }
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
            type: DataTypes.STRING(36),
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            }
        },
        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            }
        }
    });

    Categories.associate = (models) => {
        Categories.hasMany(models.Categories,
            {
                onDelete: 'RESTRICT',
                onUpdate: 'RESTRICT',
                as: 'Child',
                sourceKey: 'id',
                foreignKey: {
                    name: 'parentId'
                }
            });

        Categories.belongsTo(models.Categories, {
            as: 'Parent',
            foreignKey: {
                name: 'parentId'
            }
        });

        Categories.belongsTo(models.Users, {
            as: 'createdByUser',
            foreignKey: {
                name: 'createdBy'
            }
        });
        Categories.belongsTo(models.Users, {
            as: 'updatedByUser',
            foreignKey: {
                name: 'updatedBy'
            }
        });
    };

    return Categories;
};