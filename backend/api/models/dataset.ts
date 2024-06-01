import { DataTypes, Model, Association } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Tag from './tag';
import User from './user';


export default class Dataset extends Model {

  declare id: number;
  declare userId: number;
  declare name: string;
  declare path: string;
  declare countElements: number;
  declare countClasses: number;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare deletedAt: Date | null;

  // Association methods
  declare addTag: (tag: Tag) => Promise<void>;

  // Possible inclusions
  declare static associations: {
    tags: Association<Dataset, Tag>;
  };

}

const sequelize = SequelizeConnection.getInstance().sequelize;


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
      type: DataTypes.STRING,
      allowNull: true
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Dataset",
    tableName: "datasets",
    paranoid: true,
    timestamps: true
  },
);

Dataset.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Dataset, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'datasets',
});

Dataset.belongsToMany(Tag, { through: 'DatasetTags'});
Tag.belongsToMany(Dataset, { through: 'DatasetTags'});



// todo handle log
Dataset.sync().then(() => {
  console.log('datasets table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the datasets table:', err);
});