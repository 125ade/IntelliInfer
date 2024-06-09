import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';

// intermediate model to express many-to-many association between Dataset and Tag

class DatasetTags extends Model {}

const sequelize = SequelizeConnection.getInstance().sequelize;

DatasetTags.init(
  {
    // Chiavi esterne
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'dataset_id'
    },
    tagId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'tag_id'
    }
  },
  {
    sequelize,
    modelName: 'DatasetTags',
    tableName: 'datasetstags',
    timestamps: false,
  }
);

export default DatasetTags;

