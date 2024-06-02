import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';



export default class Tag extends Model {

  declare name: string;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

Tag.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
);

