import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import User from './user';
import DatasetTags from './datasettag';


// sequelize model of a table containing all datasets available


export default class Dataset extends Model {

  declare id: number;
  declare userId: number | null; // optional because there are already datasets available to use
  declare name: string;
  declare path: string;
  declare countElements: number;
  declare countClasses: number;
  declare description: string | null;
  declare isDeleted: boolean; 

  static associate(models: any) {
    Dataset.belongsToMany(models.Tag, { through: DatasetTags });
  }

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
      allowNull: true, 
      references: {
        model: User,
        key: 'id'
      },
      field: 'user_id' 
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
      allowNull: false,
      field: 'count_elements'
    },
    countClasses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'count_classes'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted'
    }
  },
  {
    sequelize,
    modelName: "Dataset",
    tableName: "datasets",
    paranoid: true,
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  },
);









