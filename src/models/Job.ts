import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Job extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public price!: number;
  public paid!: boolean;
  public completed!: boolean;
  public approvalStatus!: 'pending' | 'approved' | 'rejected';
  public contractId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  public static generateUUID() {
    return uuidv4();
  }
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    approvalStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
    },
    contractId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    hooks: {
      beforeCreate: (job) => {
        job.id = Job.generateUUID();
      },
    },
  }
);
