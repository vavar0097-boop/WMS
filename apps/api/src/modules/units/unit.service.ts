import { UnitRepository } from "./unit.repository";

const unitRepository = new UnitRepository();

export class UnitService {
  async getUnits(params?: {
    search?: string;
    limit?: number;
  }) {
    return unitRepository.findAll(params);
  }
}
