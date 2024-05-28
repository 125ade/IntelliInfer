import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Dataset from './dataset';
import Tag from './tag';


export default class DatasetTag extends Model {

    declare datasetId: number;

    declare tagId: number;

    declare readonly createdAt: Date;

    declare readonly updatedAt: Date;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

DatasetTag.init(
  {
    datasetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Dataset,
        key: 'id'
      }
    },
    tagId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: Tag,
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    modelName: "DatasetTag",
    tableName: "datasetstags",
    timestamps: true
  },
);

// todo handle log
DatasetTag.sync().then(() => {
  console.log('DatasetTag table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the DatasetTag table:', err);
});

