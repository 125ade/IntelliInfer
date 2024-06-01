import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Tag from './tag';
import Dataset from './dataset';

class DatasetTags extends Model {}

const sequelize = SequelizeConnection.getInstance().sequelize;

DatasetTags.init(
  {
    // Chiavi esterne
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'DatasetTags',
    tableName: 'datasetstags',
    timestamps: false
  }
);

export default DatasetTags;

// Associazioni
Dataset.belongsToMany(Tag, { through: DatasetTags });
Tag.belongsToMany(Dataset, { through: DatasetTags });