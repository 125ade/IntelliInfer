import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';

export default class Ai extends Model {

    declare id: number;

    declare name: string;

    declare description: string;

    declare pathWeights: string;

    declare updatedAt: Date;

    declare createdAt: Date;

}

const sequelizeConnection = SequelizeConnection.getInstance();

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
  },
  {
    sequelize: sequelizeConnection,
    modelName: "Ai",
    tableName: "Ai",
    timestamps: true
  },
);

Ai.sync().then(() => {
  console.log('AI table has been synchronized.');
}).catch((err) => {
  console.error('Unable to synchronize the AI table:', err);
});