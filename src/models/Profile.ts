import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Profile extends Model {
  public id!: string;
  public balance!: number;
  public type!: 'client' | 'contractor';
  public profession?: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;  
  public createdAt!: Date;
  public updatedAt!: Date;

  public static generateUUID() {
    return uuidv4();
  }
}

Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM('client', 'contractor'),
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,  
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    hooks: {
      beforeCreate: (profile) => {
        profile.id = Profile.generateUUID();
        profile.email = profile.email.toLowerCase(); 
      },
      beforeUpdate: (profile) => {
        if (profile.email) {
          profile.email = profile.email.toLowerCase(); 
        }
      },
    },
  }
);
