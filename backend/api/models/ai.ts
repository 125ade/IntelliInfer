import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import {AiArchitecture} from "../static";

export default class Ai extends Model {

    declare id: number;

    declare name: string;

    declare description: string;

    declare pathweights: string;

    declare architecture: string;

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
    pathweights: {
      type: DataTypes.CHAR(300),
      allowNull: false
    },
    architecture: {
      type: DataTypes.ENUM,
      values: Object.values(AiArchitecture),
      allowNull: false,
      defaultValue: AiArchitecture.YOLO
    }
  },
  {
    sequelize,
    modelName: "Ai",
    tableName: "ai",
    timestamps: true,
    createdAt: 'created_at', // Utilizza la convenzione 'created_at' per il timestamp di creazione
    updatedAt: 'updated_at' 
  },
);

