import { ItemType }
from "../types/item.type";

export interface UpdateItemDto {
  item_name?: string;
  item_type?: ItemType;
  base_unit_id?: string;
  barcode?: string;
  description?: string;
  is_active?: boolean;
}