import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { CourtsSite } from 'src/courts_sites/entities/courts_site.entity';

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

  @HasMany(() => CourtsSite)
  courses: CourtsSite[] | null;
// Region.hasMany(CourtsSite);
}

