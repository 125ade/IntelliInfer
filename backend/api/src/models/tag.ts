import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import DatasetTag from './datasettag'
import Dataset from './dataset'


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
    },
  },
  {
    sequelize,
    modelName: "Tag",
    tableName: "Tags",
    timestamps: true
  },
);

Tag.belongsToMany(Dataset, { through: DatasetTag });

// todo handle log
Tag.sync().then(() => {
  console.log('Tags table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the Tags table:', err);
});