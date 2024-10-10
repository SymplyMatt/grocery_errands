import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class Contract extends Model {
  public id!: string;
  public clientId!: string;
  public contractorId!: string;
  public status!: 'new' | 'in_progress' | 'terminated';
  public createdAt!: Date;
  public updatedAt!: Date;

  public static generateUUID() {
    return uuidv4();
  }
}

Contract.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    contractorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'terminated'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'contracts',
    hooks: {
      beforeCreate: (contract) => {
        contract.id = Contract.generateUUID();
      },
    },
  }
);
