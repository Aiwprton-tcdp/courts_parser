import { Injectable } from '@nestjs/common';
import { CreateCourtsSiteDto } from './dto/create-courts_site.dto';
import { UpdateCourtsSiteDto } from './dto/update-courts_site.dto';

@Injectable()
export class CourtsSitesService {
  create(createCourtsSiteDto: CreateCourtsSiteDto) {
    return 'This action adds a new courtsSite';
  }

  findAll() {
    return `This action returns all courtsSites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} courtsSite`;
  }

  update(id: number, updateCourtsSiteDto: UpdateCourtsSiteDto) {
    return `This action updates a #${id} courtsSite`;
  }

  remove(id: number) {
    return `This action removes a #${id} courtsSite`;
  }
}
