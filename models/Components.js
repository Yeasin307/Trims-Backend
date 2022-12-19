module.exports = (sequelize, DataTypes) => {

    const Components = sequelize.define("Components", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('HOME_SLIDER', 'ABOUT_US', 'VISION', 'MISSION', 'GOAL', 'CLIENT', 'GALLERY', 'MANAGEMENT', 'CEO_MESSAGE', 'COMPANY_PROFILE'),
            allowNull: false
        },
        title: {
            type: DataTypes.TEXT
        },
        subtitle: {
            type: DataTypes.TEXT
        },
        description: {
            type: DataTypes.TEXT('long')
        },
        position: {
            type: DataTypes.INTEGER
        },
        image: {
            type: DataTypes.JSON,
            get() {

                function isJson(data) {
                    try {
                        JSON.parse(data);
                    } catch (e) {
                        return false;
                    }
                    return true;
                }

                const checkJson = isJson(this.getDataValue("image"));

                if (this.getDataValue("image") !== undefined && checkJson) {
                    return JSON.parse(this.getDataValue("image"));
                }
            },
        },
        file: {
            type: DataTypes.TEXT
        },
        video: {
            type: DataTypes.TEXT
        },
        // content: {
        //     type: DataTypes.JSON,
        //     allowNull: false,
        //     get() {

        //         function isJson(data) {
        //             try {
        //                 JSON.parse(data);
        //             } catch (e) {
        //                 return false;
        //             }
        //             return true;
        //         }

        //         const checkJson = isJson(this.getDataValue("content"));

        //         if (this.getDataValue("content") !== undefined && checkJson) {
        //             return JSON.parse(this.getDataValue("content"));
        //         }
        //     },
        //     // set(value) {
        //     //     console.log(value);
        //     //     return this.setDataValue("content", JSON.stringify(value));
        //     // }
        // },
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

    Components.associate = (models) => {

        Components.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'createdByUser',
            foreignKey: {
                name: 'createdBy'
            }
        });

        Components.belongsTo(models.Users, {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
            as: 'updatedByUser',
            foreignKey: {
                name: 'updatedBy'
            }
        });
    };

    return Components;
};