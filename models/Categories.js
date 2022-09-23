module.exports = (sequelize, DataTypes) => {

    const Categories = sequelize.define("Categories", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        parentId: {
            type: DataTypes.UUID,
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

    Categories.associate = (models) => {
        Categories.hasMany(models.Categories, {
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
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'createdByUser',
            foreignKey: {
                name: 'createdBy'
            }
        });
        Categories.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'updatedByUser',
            foreignKey: {
                name: 'updatedBy'
            }
        });
    };

    return Categories;
};