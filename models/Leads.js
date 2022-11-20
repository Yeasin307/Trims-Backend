module.exports = (sequelize, DataTypes) => {

    const Leads = sequelize.define("Leads", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        leadNum: {
            type: DataTypes.BIGINT(6).UNSIGNED.ZEROFILL,
            unique: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(45),
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT
        },
        phone: {
            type: DataTypes.STRING(16)
        },
        subject: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        seen: {
            type: DataTypes.ENUM('0', '1'),
            allowNull: false,
            defaultValue: '0'
        },
    });

    Leads.associate = (models) => {

    };

    return Leads;
};