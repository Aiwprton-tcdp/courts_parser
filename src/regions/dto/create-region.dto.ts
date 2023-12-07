import { CourtTypes } from "../entities/region.entity";

export class CreateRegionDto {
  name: string;
  key: string;
  court_type: CourtTypes;
}
