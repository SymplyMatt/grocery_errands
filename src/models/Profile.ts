import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt'; // To hash passwords

export class Profile extends Model {
  public id!: string;
  public balance!: number;
  public type!: 'client' | 'contractor';
  public profession?: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string; 
  public createdAt!: Date;
  public updatedAt!: Date;

  public static generateUUID() {
    return uuidv4();
  }

  public async comparePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    hooks: {
      beforeCreate: async (profile) => {
        profile.id = Profile.generateUUID();
        profile.email = profile.email.toLowerCase();
        profile.password = await bcrypt.hash(profile.password, 10); 
      },
      beforeUpdate: async (profile) => {
        if (profile.email) {
          profile.email = profile.email.toLowerCase();
        }
        if (profile.password) {
          profile.password = await bcrypt.hash(profile.password, 10); 
        }
      },
    },
  }
);
