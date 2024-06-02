import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import DatasetTags from './datasettag';



export default class Tag extends Model {

  declare name: string;

  // Associazioni del modello
  static associate(models: any) {
    Tag.belongsToMany(models.Dataset, { through: DatasetTags });
  }

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

