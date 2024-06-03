import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import {UserRole} from "../static";

export default class User extends Model {

  declare id: number;
  
  declare username: string;
  
  declare email: string;

  declare token: number;

  declare role: string;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

/**
 * Initialize model, define sequelize connection, the name of the table, 
 * its attributes and relations
 */
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    token: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    role: {
        type: DataTypes.ENUM,
        values: Object.values(UserRole),
        allowNull: false,
        defaultValue: UserRole.USER
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at'
  },
);


