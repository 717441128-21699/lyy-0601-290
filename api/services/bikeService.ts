import { Bike, BikeStatus } from '@shared/types';
import { mockBikes, generateId } from '../data/mockData.js';

let bikes: Bike[] = [...mockBikes];

const calculateDistance = (lng1: number, lat1: number, lng2: number, lat2: number): number => {
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const a = radLat1 - radLat2;
  const b = (lng1 * Math.PI) / 180 - (lng2 * Math.PI) / 180;
  const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  return Math.round(s * 6378.137 * 1000);
};

export const bikeService = {
  getNearbyBikes(lng: number, lat: number, radius: number = 1000, status?: BikeStatus): Bike[] {
    let filteredBikes = bikes;
    if (status) {
      filteredBikes = bikes.filter(b => b.status === status);
    } else {
      filteredBikes = bikes.filter(b => b.status === 'available' || b.status === 'low-battery');
    }

    const bikesWithDistance = filteredBikes.map(bike => ({
      ...bike,
      distance: calculateDistance(lng, lat, bike.lng, bike.lat),
    }));

    return bikesWithDistance
      .filter(bike => bike.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  },

  getBikeById(bikeId: string): Bike | undefined {
    return bikes.find(b => b.id === bikeId);
  },

  getBikeByNo(bikeNo: string): Bike | undefined {
    return bikes.find(b => b.bikeNo === bikeNo);
  },

  updateBikeStatus(bikeId: string, status: BikeStatus): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    bikes[index] = { ...bikes[index], status };
    return bikes[index];
  },

  updateBikeLocation(bikeId: string, lng: number, lat: number): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    bikes[index] = { ...bikes[index], lng, lat };
    return bikes[index];
  },

  updateBattery(bikeId: string, battery: number): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    const bike = bikes[index];
    let status = bike.status;
    if (battery < 20 && status === 'available') {
      status = 'low-battery';
    } else if (battery >= 20 && status === 'low-battery') {
      status = 'available';
    }
    bikes[index] = { ...bike, battery, status };
    return bikes[index];
  },

  getAllBikes(status?: BikeStatus, areaId?: string): Bike[] {
    let result = bikes;
    if (status) {
      result = result.filter(b => b.status === status);
    }
    if (areaId) {
      result = result.filter(b => b.areaId === areaId);
    }
    return result;
  },

  createBike(bikeData: Omit<Bike, 'id'>): Bike {
    const newBike: Bike = {
      ...bikeData,
      id: generateId(),
    };
    bikes.push(newBike);
    return newBike;
  },

  deleteBike(bikeId: string): boolean {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return false;
    bikes.splice(index, 1);
    return true;
  },

  incrementRideCount(bikeId: string): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    bikes[index] = { ...bikes[index], totalRides: bikes[index].totalRides + 1 };
    return bikes[index];
  },

  incrementFaultCount(bikeId: string): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    bikes[index] = { ...bikes[index], faultCount: bikes[index].faultCount + 1 };
    return bikes[index];
  },

  updateMaintenanceTime(bikeId: string): Bike | undefined {
    const index = bikes.findIndex(b => b.id === bikeId);
    if (index === -1) return undefined;
    bikes[index] = {
      ...bikes[index],
      lastMaintenanceTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    return bikes[index];
  },
};
