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
    }
  },
  {
    sequelize,
    modelName: "Dataset",
    tableName: "datasets",
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at', // Utilizza la convenzione 'created_at' per il timestamp di creazione
    updatedAt: 'updated_at'
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




