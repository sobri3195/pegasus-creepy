import fs from 'fs/promises';
import path from 'path';

export class Storage {
  constructor(basePath = './data') {
    this.basePath = basePath;
  }

  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async saveJson(filename, data) {
    await this.ensureDir(this.basePath);
    const filePath = path.join(this.basePath, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }

  async loadJson(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async saveText(filename, text) {
    await this.ensureDir(this.basePath);
    const filePath = path.join(this.basePath, filename);
    await fs.writeFile(filePath, text, 'utf-8');
    return filePath;
  }

  async loadText(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async exists(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(filename) {
    const filePath = path.join(this.basePath, filename);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async list(pattern = '*') {
    await this.ensureDir(this.basePath);
    const files = await fs.readdir(this.basePath);
    
    if (pattern === '*') {
      return files;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return files.filter(file => regex.test(file));
  }

  getPath(filename) {
    return path.join(this.basePath, filename);
  }
}

export async function saveScreenshot(buffer, filename, basePath = './screenshots') {
  const storage = new Storage(basePath);
  await storage.ensureDir(basePath);
  const filePath = path.join(basePath, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function generateFilename(url, extension = 'json') {
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/\./g, '-');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${domain}_${timestamp}.${extension}`;
}
