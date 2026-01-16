import { Product } from '../types';
import { searchProducts } from '../constants';

export interface SearchService {
  searchProducts(query: string): Promise<Product[]>;
}

class SearchServiceImpl implements SearchService {
  async searchProducts(query: string): Promise<Product[]> {
    return await searchProducts(query);
  }
}

export default SearchServiceImpl;
