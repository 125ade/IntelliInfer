import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Tag from './tag';
import DatasetTag from './datasettag';
import User from './user';


export default class Dataset extends Model {

  declare id: number;

  declare userId: number;

  declare name: string;

  declare path: string;

  declare countElements: number;

  declare countClasses: number;

  declare description: string;

}

const sequelizeConnection = SequelizeConnection.getInstance();


Dataset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    countElements: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    countClasses: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
  },
  {
    sequelize: sequelizeConnection,
    modelName: "Dataset",
    tableName: "datasets",
    timestamps: true
  },
);

Dataset.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Dataset, {
  sourceKey: 'id',
  foreignKey: 'user_id',
  as: 'dataset',
});

Dataset.belongsToMany(Tag, { through: DatasetTag });

// todo handle log
Dataset.sync().then(() => {
  console.log('datasets table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the datasets table:', err);
});