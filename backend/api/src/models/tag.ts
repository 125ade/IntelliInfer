import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import DatasetTag from './datasettag'
import Dataset from './dataset'


export default class Tag extends Model {

  declare name: string;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

Tag.init(
  {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
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
    },
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "tags",
    timestamps: true
  },
);

Tag.belongsToMany(Dataset, { through: DatasetTag, foreignKey: 'tagId', as: 'datasets' });

// todo handle log
Tag.sync().then(() => {
  console.log('Tags table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the Tags table:', err);
});