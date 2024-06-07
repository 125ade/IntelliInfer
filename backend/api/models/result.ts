import { DataTypes, Model } from 'sequelize';
import { SequelizeConnection } from '../db/SequelizeConnection';
import Image from './image';
import Ai from './ai'; 

export default class Result extends Model {
  declare id: number;
  
  declare imageId: number;
  
  declare aiId: number;
  
  declare data: object;

  declare requestId: string;

}

const sequelize = SequelizeConnection.getInstance().sequelize;

/**
 * Initialize model, define sequelize connection, the name of the table, 
 * its attributes and relations
 */
Result.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Image,
        key: 'id'
      }
    },
    aiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Ai,
        key: 'id'
      }
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Result",
    tableName: "results",
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at'
  },
);

Result.belongsTo(Image, {
    foreignKey: 'imageId',
    as: 'image',
});
  
Result.belongsTo(Ai, {
    foreignKey: 'aiId',
    as: 'ai',
});

Image.hasMany(Result, {
    sourceKey: 'id',
    foreignKey: 'imageId',
    as: 'results',
});

Ai.hasMany(Result, {
    sourceKey: 'id',
    foreignKey: 'aiId',
    as: 'results',
});



