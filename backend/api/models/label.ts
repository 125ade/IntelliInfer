import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Dataset from './dataset'; // Assuming to have a Dataset model
import Image from './image'; 

export default class Label extends Model {
  declare id: number;
  
  declare datasetId: number;
  
  declare imageId: number;
  
  declare path: string;
  
  declare description: string;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

/**
 * Initialize model, define sequelize connection, the name of the table, 
 * its attributes and relations
 */
Label.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Dataset,
        key: 'id'
      }
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Image,
        key: 'id'
      }
    },
    path: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(300)
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
    modelName: "Label",
    tableName: "labels",
    timestamps: true
  },
);

Label.belongsTo(Dataset, {
    foreignKey: 'datasetId',
    as: 'dataset',
});
  
Label.belongsTo(Image, {
    foreignKey: 'imageId',
    as: 'image',
});

Dataset.hasMany(Label, {
    sourceKey: 'id',
    foreignKey: 'datasetId',
    as: 'dataset',
});

Image.hasMany(Label, {
    sourceKey: 'id',
    foreignKey: 'imageId',
    as: 'image',
});



