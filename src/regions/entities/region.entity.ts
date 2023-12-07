import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum CourtTypes {
  GENERAL = 'GENERAL',
  MAGISTRATE = 'MAGISTRATE',
}

@Table
export class Region extends Model {
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.INTEGER)
  key: number;

  @Column({
    defaultValue: CourtTypes.GENERAL,
    type: DataType.ENUM(...Object.values(CourtTypes))
  })
  court_type: CourtTypes;
}
