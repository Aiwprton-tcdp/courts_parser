import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Region } from 'src/regions/entities/region.entity';

@Table
export class CourtsSite extends Model {
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  link: string;

  @ForeignKey(() => Region)
  @Column(DataType.INTEGER)
  region_id: number;
}
