module.exports = (sequelize, DataTypes) => {

    const Users = sequelize.define("Users", {
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
            type: DataTypes.STRING(36),
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

    // Users.associate = (models) => {
    //   Users.hasMany(models.Posts, {
    //     onDelete: "cascade",
    //   });
    // };

    return Users;
};