import { MenuStatus } from '../enums/menu-status.enum';

export interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  price: number;
  status: MenuStatus;
  imageUrl?: string;
  /**
   * Public URL of the GLB asset. Its scene must be authored in meters so AR
   * presents the dish at its real-world size.
   */
  model3dUrl?: string;
  /** Public URL of the USDZ asset used by iOS Quick Look. */
  iosModel3dUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
