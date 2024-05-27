import { DataTypes, Model } from 'sequelize';
import {SequelizeConnection} from '../db/SequelizeConnection.js';

export default class Image extends Model {
  declare id: number;
  
  declare datasetId: number;
  
  declare path: string;
  
  declare description: string;

  declare lastUpdate: Date;

  declare creationDate: Date;
}

const sequelizeConnection = SequelizeConnection.getInstance();

/**
 * Initialize model, define sequelize connection, the name of the table, 
 * its attributes and relations
 */
Image.init(
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
    path: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(300)
    },
    lastUpdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    creationDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize: sequelizeConnection,
    modelName: "Image",
    tableName: "images",
    timestamps: false
  },
);

Image.belongsTo(Dataset, {
  foreignKey: 'datasetId',
  as: 'dataset',
});

Dataset.hasMany(Image, {
  sourceKey: 'id',
  foreignKey: 'datasetId',
  as: 'dataset',
});

// Will create the table automatically if it's not found
Image.sync().then(() => {
  console.log('Image table has been synchronized.');
}).catch(err => {
  console.error('Unable to synchronize the Image table:', err);
});

