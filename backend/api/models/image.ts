import { DataTypes, Model } from 'sequelize';
import {SequelizeConnection} from '../db/SequelizeConnection';
import Dataset from './dataset';


// sequelize model of a table containing all images

export default class Image extends Model {
  declare id: number;
  
  declare datasetId: number;
  
  declare path: string;
  
  declare description: string;

}

const sequelize = SequelizeConnection.getInstance().sequelize;


Image.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Dataset,
        key: 'id'
      },
      field: 'dataset_id'
    },
    path: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(300)
    }
  },
  {
    sequelize,
    modelName: "Image",
    tableName: "images",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
);

Image.belongsTo(Dataset, {
  foreignKey: 'datasetId',
  as: 'dataset',
});

Dataset.hasMany(Image, {
  sourceKey: 'id',
  foreignKey: 'datasetId',
  as: 'images',
});



