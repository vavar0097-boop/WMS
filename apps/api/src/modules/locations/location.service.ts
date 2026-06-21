import { LocationRepository } from "./location.repository";

const locationRepository = new LocationRepository();

export class LocationService {
  async getLocations(params?: {
    search?: string;
    warehouse_id?: string;
    location_type?: string;
    limit?: number;
  }) {
    const locations =
      await locationRepository.findAll(params);

    return locations.map((location) => ({
      id: location.id,
      location_code: location.location_code,
      location_name: location.location_name,
      location_type: location.location_type,
      warehouse_id: location.warehouse_id,
      parent_id: location.parent_id,
      is_active: location.is_active ?? true,
      created_at: location.created_at,
    }));
  }
}