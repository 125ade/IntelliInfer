import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';

export default class Ai extends Model {

    declare id: number;

    declare name: string;

    declare description: string;

    declare pathWeights: string;

    declare readonly createdAt: Date;

    declare readonly updatedAt: Date;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

Ai.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.CHAR(200),
      allowNull: false
    },
    description: {
      type: DataTypes.CHAR(300),
    },
    pathWeights: {
      type: DataTypes.CHAR(300),
      allowNull: false
    },
    architecture: {
      type: DataTypes.ENUM,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Ai",
    tableName: "ai",
    timestamps: true
  },
);

