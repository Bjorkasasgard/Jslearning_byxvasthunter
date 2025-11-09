import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');

const getFilePath = (fileName) => path.join(dataDir, `${fileName}.json`);

/**
 * Reads data from a JSON file.
 * @param {string} modelName - The name of the model (e.g., 'users', 'products').
 * @returns {Promise<Array<any>>} - A promise that resolves to an array of data.
 */
export const readData = async (modelName) => {
  const filePath = getFilePath(modelName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return an empty array.
      return [];
    }
    throw error;
  }
};

/**
 * Writes data to a JSON file.
 * @param {string} modelName - The name of the model (e.g., 'users', 'products').
 * @param {Array<any>} data - The data to write to the file.
 * @returns {Promise<void>}
 */
export const writeData = async (modelName, data) => {
  const filePath = getFilePath(modelName);
  try {
    // Ensure the directory exists
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${modelName}.json:`, error);
    throw error;
  }
};