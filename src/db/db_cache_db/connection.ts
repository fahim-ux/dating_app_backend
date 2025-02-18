import { Redis } from '@upstash/redis'
import dotenv from 'dotenv';
dotenv.config();
// const redis = new Redis({
//   url: process.env.KV_URL!, 
//   token: process.env.KV_REST_API_TOKEN!
// });
export const connectToRedis = (): Redis => {
    // if(!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null;
    const redis = new Redis({
        url: process.env.KV_REST_API_URL!, 
        token: process.env.KV_REST_API_TOKEN!, 
    });
    console.log('Connected to Redis');
    return redis;
  };
export const setData = async (redis:Redis, key: string, value: string): Promise<void> => {
    try {
      await redis.set(key, value);
      console.log(`Data saved: ${key} = ${value}`);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw new Error('Failed to save data');
    }
  };
  
  export const getData = async (redis:Redis, key: string): Promise<string | null> => {
    try {
      const data : string|null = await redis.get(key);
      return data;
    } catch (error) {
      console.error(`Error fetching data for key ${key}:`, error);
      throw new Error('Failed to fetch data');
    }
  };
  
  export const deleteData = async (redis:Redis, key: string): Promise<boolean> => {
    try {
      const result = await redis.del(key);
      return result === 1;
    } catch (error) {
      console.error(`Error deleting data for key ${key}:`, error);
      throw new Error('Failed to delete data');
    }
  };
  
  export const checkIfKeyExists = async (redis:Redis, key: string): Promise<boolean> => {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking if key ${key} exists:`, error);
      throw new Error('Failed to check if key exists');
    }
  };

