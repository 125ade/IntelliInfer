import { DataTypes, Model, Association } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Tag from './tag';
import User from './user';
import DatasetTags from './datasettag';


export default class Dataset extends Model {

  declare id: number;
  declare userId: number | null; // NB lo metto ora opzionale per testare la rotta create dataset
  declare name: string;
  declare path: string;
  declare countElements: number;
  declare countClasses: number;
  declare description: string | null;
  declare isDeleted: boolean; 

  // Associazioni del modello
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
      allowNull: true, // NB solo per ora
      references: {
        model: User,
        key: 'id'
      },
      field: 'user_id' // Aggiungi questo campo per indicare il nome corretto della colonna nel database
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
    createdAt: 'created_at', // Utilizza la convenzione 'created_at' per il timestamp di creazione
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  },
);




/** 
Dataset.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Dataset, {
  sourceKey: 'id',
  foreignKey: 'userId',
  as: 'datasets',
});
*/




