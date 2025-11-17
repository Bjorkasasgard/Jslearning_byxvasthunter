import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');

const getFilePath = (fileName) => path.join(dataDir, `${fileName}.json`);

/**
 Reads data from aJSON file.
 @param {string} modelName 
 @returns {Promise<Array<any>>} 
 */
export const readData = async (modelName) => {
  const filePath = getFilePath(modelName);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
    
      return [];
    }
    throw error;
  }
};

/**
 * Writes data to a JSON file.
 * @param {string} modelName 
 * @param {Array<any>} data 
 * @returns {Promise<void>}
 */
export const writeData = async (modelName, data) => {
  const filePath = getFilePath(modelName);
  try {

    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing to ${modelName}.json:`, error);
    throw error;
  }
};