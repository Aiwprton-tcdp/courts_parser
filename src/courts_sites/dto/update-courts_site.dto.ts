import { PartialType } from '@nestjs/mapped-types';
import { CreateCourtsSiteDto } from './create-courts_site.dto';

export class UpdateCourtsSiteDto extends PartialType(CreateCourtsSiteDto) {
  name: string;
  link: string;
}
