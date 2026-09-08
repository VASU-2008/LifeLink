export interface Coordinates {
  lat: number;
  lng: number;
}

export class MapService {
  /**
   * Earth's radius in kilometers
   */
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculate great-circle distance between two geographic coordinates using the Haversine formula.
   */
  static calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    if (!coord1 || !coord2) return 999;
    if (coord1.lat === coord2.lat && coord1.lng === coord2.lng) return 0;

    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLng = this.deg2rad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.lat)) *
        Math.cos(this.deg2rad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;

    return Math.round(distance * 10) / 10; // 1 decimal place
  }

  /**
   * Format distance safely to protect exact donor coordinates
   * Example: "Approximately 3.2 km away"
   */
  static formatSafeDistance(distanceKm: number): string {
    if (distanceKm < 0.5) return 'Within 500 meters';
    if (distanceKm < 1) return 'Approximately 0.8 km away';
    return `Approximately ${distanceKm.toFixed(1)} km away`;
  }

  /**
   * Approximate bounding box for geo-filtering
   */
  static getBoundingBox(center: Coordinates, radiusKm: number) {
    const latDelta = radiusKm / 111; // 1 deg lat ~ 111 km
    const lngDelta = radiusKm / (111 * Math.cos(this.deg2rad(center.lat)));

    return {
      minLat: center.lat - latDelta,
      maxLat: center.lat + latDelta,
      minLng: center.lng - lngDelta,
      maxLng: center.lng + lngDelta,
    };
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
